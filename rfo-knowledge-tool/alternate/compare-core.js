'use strict';
// Alignment and diff engine shared in behavior with the original FORGE.
// Duplicate labels are retained; unmatched text is never assumed deleted.
function stripMarkers(str) {
  return String(str)
    .replace(/\{\{[+\-~](.*?)[+\-~]\}\}/gs, '$1');
}

function diffTokenize(str) {
  return str.match(/[A-Za-z0-9']+|[^A-Za-z0-9']+/g) || [];
}

function normToken(tok) {
  return tok.toLowerCase().replace(/\s+/g,' ');
}

function diffTokens(aTokens, bTokens) {
  const MAX = 600;
  if (aTokens.length > MAX || bTokens.length > MAX) {
    return [
      {type:'rem', text: aTokens.join('')},
      {type:'add', text: bTokens.join('')}
    ];
  }
  const m = aTokens.length, n = bTokens.length;
  const dp = Array.from({length: m + 1}, () => new Int16Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = normToken(aTokens[i-1]) === normToken(bTokens[j-1])
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normToken(aTokens[i-1]) === normToken(bTokens[j-1])) {
      ops.unshift({type:'eq', text: bTokens[j-1], legacyText:aTokens[i-1]});
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      ops.unshift({type:'add', text: bTokens[j-1]});
      j--;
    } else {
      ops.unshift({type:'rem', text: aTokens[i-1]});
      i--;
    }
  }
  const coalesced = [];
  for (const op of ops) {
    const last = coalesced[coalesced.length - 1];
    if (last && last.type === op.type) { last.text += op.text; if (op.type === 'eq') last.legacyText += op.legacyText; }
    else coalesced.push({...op});
  }
  return coalesced;
}

function renderDiffOps(ops, mode) {
  const frag = document.createDocumentFragment();
  for (const op of ops) {
    if (op.type === 'eq') {
      frag.appendChild(document.createTextNode(op.text));
    } else if (op.type === 'rem') {
      const s = document.createElement('span');
      s.className = 'rem';
      s.textContent = op.text;
      frag.appendChild(s);
    } else if (op.type === 'add' && mode !== 'legacy') {
      const s = document.createElement('span');
      s.className = 'add';
      s.textContent = op.text;
      frag.appendChild(s);
    }
  }
  return frag;
}

function renderPlain(text, mode) {
  const frag = document.createDocumentFragment();
  const s = document.createElement('span');
  if (mode === 'legacy-removed') s.className = 'rem';
  else if (mode === 'rfo-added') s.className = 'add';
  s.textContent = text;
  frag.appendChild(s);
  return frag;
}


// ═══════════════════════════════════════════════════════════════════
//  BULLET ALIGNMENT (Jaccard)
// ═══════════════════════════════════════════════════════════════════
const STOPWORDS = new Set(['a','an','the','of','in','to','and','or','for',
  'is','are','was','were','be','been','being','have','has','had','do','does',
  'did','will','would','could','should','may','might','shall','not','this',
  'that','with','from','at','by','as','on','it','its','if','any','all']);

function wordSet(str) {
  const tokens = String(str).toLowerCase().match(/[a-z0-9]+/g) || [];
  return new Set(tokens.filter(t => !STOPWORDS.has(t) && t.length > 1));
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}

function alignBullets(legacy, rfo) {
  const legacySets = legacy.map(b => wordSet(stripMarkers(b.t)));
  const rfoSets    = rfo.map(b => wordSet(stripMarkers(b.t)));
  const usedRfo    = new Set();
  const rows       = [];

  for (let li = 0; li < legacy.length; li++) {
    let bestJ = -1, bestScore = 0.12;
    for (let ri = 0; ri < rfo.length; ri++) {
      if (usedRfo.has(ri)) continue;
      const s = jaccard(legacySets[li], rfoSets[ri]);
      if (s > bestScore) { bestScore = s; bestJ = ri; }
    }
    if (bestJ >= 0) {
      usedRfo.add(bestJ);
      rows.push({kind:'matched', legacy: legacy[li], rfo: rfo[bestJ]});
    } else {
      rows.push({kind:'legacy-only', legacy: legacy[li], rfo: null});
    }
  }
  for (let ri = 0; ri < rfo.length; ri++) {
    if (!usedRfo.has(ri)) rows.push({kind:'rfo-only', legacy: null, rfo: rfo[ri]});
  }
  return rows;
}


// ═══════════════════════════════════════════════════════════════════
//  FAR TEXT PARSER
// ═══════════════════════════════════════════════════════════════════
// Classify a label like "(a)", "(1)", "(i)" into a level family:
//   'alpha'   — (a)(b)(c)...(z) lowercase letters
//   'ALPHA'   — (A)(B)(C)... uppercase letters
//   'num'     — (1)(2)(3)...
//   'roman'   — (i)(ii)(iii)... lowercase roman
//   'other'   — anything else
function labelLevel(label) {
  const inner = label.replace(/[()]/g, '');
  if (/^[a-z]$/.test(inner) && inner !== 'i') return 'alpha';
  if (/^[ivxlcdm]+$/.test(inner)) return 'roman';
  if (/^[a-z]$/.test(inner)) return 'alpha';
  if (/^[A-Z]$/.test(inner))      return 'ALPHA';
  if (/^\d+$/.test(inner))        return 'num';
  return 'other';
}

// Detect the dominant top-level label style for a given text by looking at
// the first label that appears. We only split paragraphs at that level so
// sub-bullets (e.g. "(1)" under "(b)") stay inline with their parent.
function detectTopLevel(rawText) {
  const m = rawText.match(/^\s*(\([a-zA-Z0-9]{1,4}\))/m);
  return m ? labelLevel(m[1]) : 'alpha';
}

function parseFarSubparas(rawText) {
  const topLevel = detectTopLevel(rawText);
  const lines = rawText.split('\n');
  const labels = lines.map(line => line.match(/^(\s*)(\([a-zA-Z0-9]{1,4}\))\s*(.*)/));
  const indents = labels.filter(m => m && labelLevel(m[2]) === topLevel).map(m => m[1].length);
  const alphaIndentCeiling = indents.length ? Math.max(...indents) : 0;
  const minimumIndent = indents.length ? Math.min(...indents) : 0;
  const result = []; let current = null;
  lines.forEach((line, i) => {
    const m = labels[i];
    if (m && (topLevel === 'alpha' || topLevel === 'ALPHA' || m[1].length === minimumIndent) && (labelLevel(m[2]) === topLevel || (topLevel === 'alpha' && m[2] === '(i)' && m[1].length <= alphaIndentCeiling))) {
      if (current) result.push(current);
      current = {label:m[2], text:m[3]};
    } else if (line.trim()) {
      // PDF wrapping and nested bullets remain attached to their parent.
      // Consecutive preamble lines are one block rather than one warning per line.
      if (!current) current = {label:'', text:line.trim()};
      else current.text += ' ' + line.trim();
    }
  });
  if (current) result.push(current);
  return result.filter(p => p.text.trim());
}

function alignByLabel(legacyParas, rfoParas) {
  // A label can recur under different numbered sections. Never overwrite or
  // drop a paragraph just because an earlier section also used (a) or (b).
  const rfoMap = new Map();
  for (const p of rfoParas) {
    if (!rfoMap.has(p.label)) rfoMap.set(p.label, []);
    rfoMap.get(p.label).push(p);
  }
  const usedRfo = new Set();
  const rows = [];

  for (const lp of legacyParas) {
    if (rfoMap.get(lp.label)?.length) {
      const rp = rfoMap.get(lp.label).shift();
      rows.push({kind:'matched', legacy: lp, rfo: rp});
      usedRfo.add(rp);
    } else {
      rows.push({kind:'legacy-only', legacy: lp, rfo: null});
    }
  }
  for (const rp of rfoParas) {
    if (!usedRfo.has(rp)) {
      rows.push({kind:'rfo-only', legacy: null, rfo: rp});
    }
  }
  return relocateUnmatched(rows);
}

// Second pass: pair leftover legacy-only + rfo-only paragraphs by CONTENT
// similarity (not label). A strong match means the text was relocated /
// renumbered rather than deleted — so we surface the new paragraph number
// instead of an alarming "no corresponding text" placeholder.
function relocateUnmatched(rows) {
  const legIdx = [], rfoIdx = [];
  rows.forEach((r, i) => {
    if (r.kind === 'legacy-only') legIdx.push(i);
    else if (r.kind === 'rfo-only') rfoIdx.push(i);
  });
  if (!legIdx.length || !rfoIdx.length) return rows;
  const rfoSets = rfoIdx.map(i => wordSet(stripMarkers(rows[i].rfo.text)));
  const usedRfo = new Set();
  for (const li of legIdx) {
    // Only flag a true paragraph move: both sides must carry a label
    // (e.g. (a)→(c)). Unlabeled preamble shifts are structural noise, not
    // the "renumbered paragraph" case the relocation badge is meant for.
    if (!rows[li].legacy.label) continue;
    const lset = wordSet(stripMarkers(rows[li].legacy.text));
    let bestK = -1, best = 0.34;  // conservative — avoid false relocations
    for (let k = 0; k < rfoIdx.length; k++) {
      if (usedRfo.has(k) || !rows[rfoIdx[k]].rfo.label) continue;
      const s = jaccard(lset, rfoSets[k]);
      if (s > best) { best = s; bestK = k; }
    }
    if (bestK >= 0) {
      usedRfo.add(bestK);
      rows[li] = {kind: 'relocated', legacy: rows[li].legacy, rfo: rows[rfoIdx[bestK]].rfo};
      rows[rfoIdx[bestK]] = null;
    }
  }
  return rows.filter(Boolean);
}


// ═══════════════════════════════════════════════════════════════════
//  BLOCK BUILDERS
// ═══════════════════════════════════════════════════════════════════
