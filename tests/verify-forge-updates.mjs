import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../rfo-knowledge-tool');
const baseline = JSON.parse(readFileSync(join(root, 'kb.json'), 'utf8'));
const update = JSON.parse(readFileSync(join(root, 'updates.json'), 'utf8'));
const replacements = new Map(update.entries.map(e => [e.id, e]));
const entries = baseline.entries.map(e => { const replacement = replacements.get(e.id); replacements.delete(e.id); return replacement || e; });
entries.push(...replacements.values());
const meta = update.meta;
const ids = new Set(entries.map(e => e.id));
assert.equal(ids.size, entries.length, 'Entry IDs must be unique');
assert.equal(meta.entryCount, entries.length, 'Entry count must reflect actual data');
assert.equal(meta.lastUpdated, '2026-10-01');
assert(!meta.rfoEffective, 'A source baseline must not be labelled a universal effective date');
for (const update of meta.updates) {
  assert(['effective', 'proposed', 'project'].includes(update.status));
  for (const id of update.entryIds) assert(ids.has(id), `Missing update target: ${id}`);
  for (const source of update.links) assert(/^https:\/\//.test(source.url));
}
const proposed = meta.updates.find(u => u.status === 'proposed');
assert.equal(proposed.commentDeadline, '2026-10-19');
for (const caseNumber of ['2026-003','2026-006','2026-010','2026-011']) {
  assert(proposed.details.some(d => d.includes(caseNumber)));
}
const award = entries.find(e => e.id === 'afars-5105-302');
assert(award.supplementalText.text.includes('by 8 p.m. ET'));
assert(award.supplementalText.text.includes('three business days'));
assert(award.supplementalText.text.includes('formal ODASA(P) approval'));
assert(award.legacyText.includes('by noon of the proposed award date'));
assert(award.sourceNote.includes('not initial package submission or public release'));
const refreshed = entries.filter(e => e.reviewedOn === meta.lastUpdated);
assert.equal(refreshed.filter(e => e.group.startsWith('DFARS')).length, 8);
assert.equal(refreshed.filter(e => e.group.startsWith('AFARS')).length, 9);
for (const e of refreshed.filter(e => e.group.startsWith('DFARS') || e.group.startsWith('AFARS'))) {
  assert(e.sourceEditions?.legacy && e.sourceEditions?.revised);
  assert(e.rfoText.length > 50, `Current text missing: ${e.id}`);
  assert(!e.rfoText.includes('TODO:'));
}
for (const id of ['cas-thresholds-2026','cas-407-2026']) {
  const e = entries.find(e => e.id === id);
  assert.equal(e.effectiveDate, '2026-10-01');
  assert.equal(e.status, 'effective');
  assert(e.summaryOnly);
}
const html = readFileSync(join(root, 'RFO_tool.html'), 'utf8');
assert(html.includes('id="updatesSection"'));
assert(html.includes("resetFilters({clearRegType: true})"));
assert(html.includes("script-src 'nonce-rfo2026'"));
assert(html.includes("connect-src 'self'"));
assert(html.includes('entry.sourceEditions?.revised'));
assert(html.includes('const url = safeUrl(source.url)'));
console.log(`Verified ${entries.length} entries, ${meta.updates.length} release notes, award deadlines, source editions, and proposal separation.`);
