'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const all = sel => [...document.querySelectorAll(sel)];
  const state = {entries: [], byId: new Map(), meta: {}, entry: null, detail: 'overview', layout: 'aligned', page: 0, results: [], saved: new Set()};
  const PAGE_SIZE = 20;
  const LABELS = {far: ['Legacy FAR', 'RFO model deviation'], dfars: ['Legacy DFARS', 'Revised DFARS'], afars: ['Legacy AFARS', 'Revised AFARS / PGI'], cas: ['Historical CAS baseline', 'CAS final rule notice']};
  const element = (tag, cls, text) => {const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e;};
  const regType = e => e.title.startsWith('CAS') ? 'cas' : e.group.startsWith('DFARS') ? 'dfars' : e.group.startsWith('AFARS') ? 'afars' : 'far';
  const clean = text => stripMarkers(String(text || ''));
  const validText = text => typeof text === 'string' && text.trim() && !text.startsWith('TODO');
  const sectionNumber = e => e.title.match(/^(?:FAR|DFARS|AFARS)\s+(\d+\.[\w-]+)/)?.[1];
  const announce = text => {$('announcement').textContent = text;};
  function link(label, url) {
    try {const parsed = new URL(url); if (!['https:', 'http:'].includes(parsed.protocol)) return null;
      const a = element('a', '', label + ' ↗'); a.href = parsed.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
    } catch {return null;}
  }
  function showPage(page) {
    all('[data-screen]').forEach(e => e.hidden = e.dataset.screen !== page);
    all('[data-page]').forEach(e => e.setAttribute('aria-pressed', String(e.dataset.page === page)));
  }
  function buildGroups() {
    const previous = $('group').value; $('group').replaceChildren(new Option('All parts', ''));
    const groups = [...new Set(state.entries.filter(e => $('reg').value === 'all' || regType(e) === $('reg').value).map(e => e.group))];
    groups.sort((a,b) => a.localeCompare(b, undefined, {numeric:true})).forEach(g => $('group').add(new Option(g, g)));
    if (groups.includes(previous)) $('group').value = previous;
  }
  function searchFields(e) {
    return [{label:'Title',text:e.title},{label:'Summary',text:e.summary},...['legacy','rfo'].flatMap(side=>(e[side]||[]).map(x=>({label:side==='legacy'?'Legacy overview':'Revised overview',text:x.t}))),{label:'Legacy source text',text:e.legacyText},{label:'Revised source text',text:e.rfoText},{label:e.supplementalText?.label||'Supplementary procedure',text:e.supplementalText?.text},{label:'Source note',text:e.sourceNote}].filter(x=>validText(x.text));
  }
  function excerpt(e, query) {
    const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const fields=searchFields(e), field=fields.find(x=>terms.every(t=>x.text.toLowerCase().includes(t)))||fields.find(x=>terms.some(t=>x.text.toLowerCase().includes(t)));
    if(!field)return null;
    const text=clean(field.text).replace(/\s+/g,' ');const i=Math.max(0,text.toLowerCase().indexOf(terms[0]));const start=Math.max(0,i-70);
    return {label:field.label,text:(start?'…':'')+text.slice(start,start+240)+(text.length>start+240?'…':'')};
  }
  function highlighted(text,query) {
    const span=element('span');const terms=query.trim().split(/\s+/).filter(Boolean).sort((a,b)=>b.length-a.length);
    if(!terms.length){span.textContent=text;return span;}
    const escaped=terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));const re=new RegExp('('+escaped.join('|')+')','gi');
    let last=0;for(const match of text.matchAll(re)){span.append(document.createTextNode(text.slice(last,match.index)),element('mark','',match[0]));last=match.index+match[0].length;}span.append(document.createTextNode(text.slice(last)));return span;
  }
  function resultButton(e,query) {
    const b=element('button','search-result');b.type='button';b.dataset.entry=e.id;b.append(element('strong','',e.title));const hit=excerpt(e,query);
    if(hit){b.append(element('span','fg-small',hit.label),highlighted(hit.text,query));}else b.append(element('span','fg-small',e.summary));
    b.addEventListener('click',()=>{if(query)state.detail='full';openEntry(e.id,true);});return b;
  }
  function search(resetPage = true) {
    if (resetPage) state.page = 0;
    const terms = $('search').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    state.results = state.entries.filter(e => ($('reg').value === 'all' || regType(e) === $('reg').value) && (!$('group').value || e.group === $('group').value) && (!$('savedOnly').checked || state.saved.has(e.id)) && terms.every(t => e.searchText.includes(t)));
    state.results.sort((a,b) => {const query = $('search').value.toLowerCase().trim(); if (!query) return 0; const score = e => e.title.toLowerCase().includes(query) ? 2 : e.summary.toLowerCase().includes(query) ? 1 : 0; return score(b)-score(a);});
    state.page = Math.max(0, Math.min(state.page, Math.ceil(state.results.length/PAGE_SIZE)-1)); renderList();
  }
  function renderList() {
    $('resultCount').textContent = state.results.length.toLocaleString() + ' matching sections';
    const nav = $('sectionList'); nav.replaceChildren();
    const list = state.results.slice(state.page*PAGE_SIZE,(state.page+1)*PAGE_SIZE);
    if (!list.length) nav.append(element('p', 'fg-small', $('savedOnly').checked ? 'No saved sections match. Save a section or clear the filters.' : 'No matches. Try a topic or clear the filters.'));
    list.forEach(e => {const b = element('button'); b.type = 'button'; b.dataset.entry = e.id; b.setAttribute('aria-current',String(e.id === state.entry?.id));
      const citation = sectionNumber(e); b.append(element('span','',citation ? regType(e).toUpperCase() + ' ' + citation : e.title), element('span','fg-small',citation ? e.title.split(' — ').slice(1).join(' — ') || e.title : e.group));
      const query=$('search').value.trim();if(query){const hit=excerpt(e,query);if(hit){b.append(element('span','fg-small',hit.label),highlighted(hit.text,query));}}b.addEventListener('click',()=>{if(query)state.detail='full';openEntry(e.id,true);});nav.append(b);
    });
    const pages = Math.max(1,Math.ceil(state.results.length/PAGE_SIZE)); $('pageCount').textContent = (state.page+1) + ' / ' + pages;
    const query=$('search').value.trim();$('searchResults').replaceChildren();$('searchScope').textContent=state.results.length+' sections match across stored titles, summaries, and source text. Filters: '+$('reg').selectedOptions[0].textContent+($('group').value?' · '+$('group').value:'');if(query){list.forEach(e=>$('searchResults').append(resultButton(e,query)));const terms=query.toLowerCase().split(/\s+/);for(const note of state.meta.updates||[]){const text=[note.title,note.summary,...note.details||[]].join(' ');if(terms.every(t=>text.toLowerCase().includes(t))){const b=element('button','search-result');b.append(element('strong','','Update: '+note.title),highlighted(note.summary,query));b.addEventListener('click',()=>showPage('updates'));$('searchResults').append(b);}}for(const r of RESOURCES){if(terms.every(t=>(r.label+' '+r.url).toLowerCase().includes(t))){const a=link(r.label,r.url);if(a)$('searchResults').append(a);}}if(!$('searchResults').children.length)$('searchResults').append(element('p','','No matching text. Try fewer words or clear filters.'));}
    $('prev').disabled = state.page === 0; $('next').disabled = state.page+1 >= pages;
  }
  function openEntry(id, focus = false) {
    const entry = state.byId.get(id); if (!entry) return;
    state.entry = entry; showPage('compare');
    history.replaceState(null,'','#' + encodeURIComponent(id)); renderEntry(); renderList();
    if (focus) { $('workspace').focus({preventScroll:true}); $('workspace').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
  }
  function overviewRows(e) {
    // Editorial bullets describe the same section; compare them in their stored order.
    // This is distinct from paragraph-level legal-text alignment.
    const legacy=e.legacy||[], revised=e.rfo||[];
    return Array.from({length:Math.max(legacy.length,revised.length)},(_,i)=>({
      kind:legacy[i]&&revised[i]?'matched':legacy[i]?'legacy-only':'rfo-only',
      legacy:legacy[i]?{label:'',text:clean(legacy[i].t)}:null,
      rfo:revised[i]?{label:'',text:clean(revised[i].t)}:null
    }));
  }
  function mappedRows(e,legacy,revised) {
    if(!e.paragraphMappings)return alignByLabel(legacy,revised);
    const usedLegacy=new Set(),usedRevised=new Set(),rows=[];
    const combine=(paragraphs,labels,used)=>{const found=paragraphs.filter(p=>labels.includes(p.label)&&!used.has(p));found.forEach(p=>used.add(p));return found.length?{label:found.map(p=>p.label).join(' + '),text:found.map(p=>p.text).join('\n\n')}:null;};
    for(const mapping of e.paragraphMappings){const l=combine(legacy,mapping.legacyLabels,usedLegacy),r=combine(revised,mapping.revisedLabels,usedRevised);if(l||r)rows.push({kind:l&&r?'mapped':l?'legacy-only':'rfo-only',legacy:l,rfo:r});}
    // Keep unreviewed preambles/unpaired source paragraphs without guessing matches.
    legacy.filter(p=>!usedLegacy.has(p)).forEach(p=>rows.push({kind:'legacy-only',legacy:p,rfo:null}));
    revised.filter(p=>!usedRevised.has(p)).forEach(p=>rows.push({kind:'rfo-only',legacy:null,rfo:p}));
    return rows;
  }
  function comparisonRows(e) {
    if (state.detail === 'full' && !e.summaryOnly && validText(e.legacyText) && validText(e.rfoText)) return mappedRows(e,parseFarSubparas(clean(e.legacyText)),parseFarSubparas(clean(e.rfoText)));
    return overviewRows(e);
  }
  // Exact original text is preserved on each side, including capitalization.
  // Long blocks use a bounded whole-block diff rather than an unbounded LCS.
  function fillText(p, row, side, ops, isChanged) {
    const own = side === 'legacy' ? row.legacy : row.rfo;
    if (!own) {p.className = 'no-match';p.textContent = 'No directly aligned counterpart. Text may be new, renumbered, or consolidated; verify the source.';return;}
    if (!$('highlight').checked || !isChanged) {p.textContent = own.text; return;}
    if (!ops) {p.className='fg-highlight'+(side==='rfo'?' after':'');p.textContent=own.text; return;}
    for (const op of ops) {
      if (op.type === 'eq') p.append(document.createTextNode(side==='legacy'?op.legacyText:op.text));
      else if ((side==='legacy'&&op.type==='rem')||(side==='rfo'&&op.type==='add')) p.append(element(side==='legacy'?'del':'ins','',op.text));
    }
  }
  function renderEntry() {
    const e = state.entry; if (!e) return;
    const reg = regType(e), labels = [...LABELS[reg]]; if(e.legacyCitation)labels[0]+=' '+e.legacyCitation; if(e.revisedCitation)labels[1]+=' '+e.revisedCitation; const versions = e.sourceEditions || state.meta.versions?.[reg] || {};
    $('breadcrumb').textContent = e.group; $('entryTitle').textContent = e.title; $('entrySubtitle').textContent = e.summaryOnly ? 'Source notice · summary comparison' : labels[0] + ' → ' + labels[1];
    $('summaryText').textContent = e.summary || 'Compare the source text below.';
    $('save').disabled=false;$('save').setAttribute('aria-pressed',String(state.saved.has(e.id)));$('save').textContent=state.saved.has(e.id)?'Saved':'Save';$('share').disabled=false;$('print').disabled=false;
    all('[data-detail]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.detail===state.detail)));all('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===state.layout)));
    const comparison=$('comparison'); comparison.replaceChildren();comparison.classList.toggle('fg-reading',state.layout==='reading');
    const heads=element('div','fg-columnheads'); labels.forEach((name,i)=>{const head=element('div','fg-columnhead'+(i?' fg-rfo-heading':''));head.append(element('strong','',name),element('div','fg-small',i ? versions.revised || (e.effectiveDate?'Effective '+e.effectiveDate:'See official source') : versions.legacy || 'Historical baseline'));heads.append(head);});comparison.append(heads);
    const rows=comparisonRows(e); let visible=0,changed=0;
    const unaligned = {legacy:[], rfo:[]};
    if(e.comparisonNote)comparison.append(element('div','mapping-note',e.comparisonNote));
    rows.forEach(row=>{const isChanged=row.kind!=='matched'||row.legacy.text!==row.rfo.text||row.legacy.label!==row.rfo.label;if (isChanged) changed++;
      if (!row.legacy || !row.rfo) {if(row.legacy)unaligned.legacy.push(row.legacy);if(row.rfo)unaligned.rfo.push(row.rfo);return;}
      if ($('changesOnly').checked&&!isChanged) return;visible++;
      const pair=element('div','fg-row');const ops=row.legacy&&row.rfo&&isChanged&&$('highlight').checked?diffTokens(diffTokenize(row.legacy.text),diffTokenize(row.rfo.text)):null;
      ['legacy','rfo'].forEach((side,index)=>{const own=row[side],other=row[side==='legacy'?'rfo':'legacy'];const cell=element('div','fg-cell');cell.append(element('div','fg-readinglabel',labels[index]));
        let status=!isChanged?'Unchanged':row.kind==='mapped'?'Reviewed topic mapping':row.kind==='relocated'?'Likely renumbered · verify':row.kind==='matched'?'Changed':own?'Unmatched source text':'No aligned counterpart';
        if(own?.label) status=own.label+' · '+status;if((row.kind==='relocated'||row.kind==='mapped')&&other?.label) status+=' · counterpart '+other.label;
        cell.append(element('span','fg-status'+(isChanged?(index?' after':' before'):''),status));const p=element('p');fillText(p,row,side,ops,isChanged);cell.append(p);pair.append(cell);
      });comparison.append(pair);
    });
    const unmatched=unaligned.legacy.length+unaligned.rfo.length;
    if(unmatched){
      comparison.append(element('p','alignment-note','Some paragraphs could not be paired reliably. They are preserved below; this does not establish that a requirement was added or removed.'));
      const groups=element('div','unaligned-groups');
      ['legacy','rfo'].forEach((side,index)=>{if(!unaligned[side].length)return;const detail=element('details','unaligned-group');detail.append(element('summary','',labels[index]+': '+unaligned[side].length+' paragraphs not aligned'));
        unaligned[side].forEach(para=>{const block=element('div','unaligned-paragraph');if(para.label)block.append(element('span','fg-status',para.label));block.append(element('p','',para.text));detail.append(block);});groups.append(detail);});comparison.append(groups);
    }
    if (!visible) comparison.append(element('p','alignment-note',unmatched?'No paired paragraphs in this view. Expand the source groups to read the preserved text.':'No changed rows in this view. Turn off “Changes only” to see all text.'));
    $('rowCount').textContent = visible+' paired rows shown · '+unmatched+' paragraphs in source groups';
    const fullLoaded=state.detail==='full'&&!e.summaryOnly&&validText(e.legacyText)&&validText(e.rfoText);
    $('contentNote').textContent=fullLoaded?'Full stored source text · alignment is a reading aid, not a legal determination.':state.detail==='full'?'Full source text is not loaded for this entry. Showing its editorial summary.':'Editorial overview · not regulatory quotations.';
    $('procedures').hidden=!e.supplementalText?.text;$('procedureTitle').textContent=e.supplementalText?.label || 'Supplementary procedure';$('procedureText').textContent=e.supplementalText?.text || '';
    renderSources(e,reg);renderRelated(e);announce(e.title+' selected.');
  }
  function renderSources(e,reg) {
    const body=$('sourceBody');body.replaceChildren();
    if(e.comparisonNote) body.append(element('p','',e.comparisonNote));
    if(e.sourceNote) body.append(element('p','',e.sourceNote));
    if(e.effectiveDate) body.append(element('p','','Entry effective date: '+e.effectiveDate));
    if(reg==='far'){const part=e.group.match(/^Part (\d+)/)?.[1];const dates=state.meta.partDates?.[part];if(dates)body.append(element('p','','Part source issued '+dates.issued+(dates.updated?'; updated '+dates.updated:'')));
      body.append(element('p','','RFO model deviations require applicable agency implementation. Project update dates do not establish blanket regulatory effective dates.'));
    }
    (e.sources||[]).forEach((s,i)=>body.append(element('p','',(i===0?'Legacy / baseline: ':i===1?'Revised source: ':'Source: ')+s)));
    $('entrySources').replaceChildren();sectionLinks(e,reg).forEach(s=>{const a=link(s.label,s.url);if(a)body.append(a);const visible=link(s.label,s.url);if(visible)$('entrySources').append(visible);});
    if(state.meta.currencyNote)body.append(element('p','',state.meta.currencyNote));
  }
  const RESOURCES=[
    {label:'DARS — Defense Acquisition Regulations System',url:'https://www.acq.osd.mil/dpap/dars/index.html'},
    {label:'DARS — current DFARS and PGI',url:'https://www.acq.osd.mil/dpap/dars/dfarspgi/current/index.html'},
    {label:'DARS — current class deviations',url:'https://www.acq.osd.mil/dpap/dars/class_deviations.html'},
    {label:'DARS — DFARS RFO class deviations',url:'https://www.acq.osd.mil/dpap/dars/dfars_far_overhaul_class_deviations.html'},
    {label:'Acquisition.gov — FAR',url:'https://www.acquisition.gov/browse/index/far'},
    {label:'Acquisition.gov — FAR overhaul',url:'https://www.acquisition.gov/far-overhaul'},
    {label:'Army — AFARS and PGI',url:'https://www.army.mil/armycontracting'}
  ];
  function sectionLinks(e,reg) {
    const links=[...e.deepLinks||[]],number=e.legacyCitation||sectionNumber(e);
    if(number&&reg==='far')links.push({label:'Codified FAR '+number,url:'https://www.acquisition.gov/far/'+number});
    if(number&&reg==='dfars')links.push({label:'Acquisition.gov DFARS '+number,url:'https://www.acquisition.gov/dfars/'+number},RESOURCES[1],RESOURCES[2],RESOURCES[3]);
    if(number&&reg==='far'){const part=Number((e.revisedCitation||sectionNumber(e)).split('.')[0]);links.push({label:'RFO model deviation — Part '+part,url:'https://www.acquisition.gov/far-overhaul/far-part-deviation-guide/far-overhaul-part-'+part},RESOURCES[3]);}
    if(reg==='afars')links.push(RESOURCES[6]);
    const seen=new Set();return links.filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true;});
  }
  function renderRelated(e) {
    $('related').replaceChildren();const number=sectionNumber(e);if(!number)return;
    const partOf = x => {const p=sectionNumber(x)?.split('.')[0] || '';return regType(x)==='afars'?p.replace(/^51/,''):regType(x)==='dfars'?p.replace(/^2/,''):p;}; const stem=partOf(e);
    const related=state.entries.filter(x=>x.id!==e.id&&regType(x)!==regType(e)&&sectionNumber(x)&&partOf(x)===stem).slice(0,5);
    if(related.length){$('related').append(element('span','fg-small','Related part topics:'));related.forEach(x=>{const b=element('button','',x.title);b.type='button';b.addEventListener('click',()=>openEntry(x.id,true));$('related').append(b);});}
  }
  function renderUpdates() {
    $('releaseNotes').replaceChildren();const release=element('article','fg-update');release.append(element('h2','','October 9 — Search, guide, and official resources'),element('p','','Search now shows highlighted matches from stored text across FORGE. Added a first-use guide, clearer light/dark controls, DARS resources, section source links, and the no-token Ask FORGE database finder. Biweekly resource review scheduled; no regulatory text was revalidated in this interface release.'));$('releaseNotes').append(release);$('updatesDate').textContent='Project review: '+(state.meta.lastUpdated||'See source notes');
    for (const note of state.meta.updates||[]) {
      const article=element('article','fg-update'); const meta=element('div','fg-update-meta');meta.append(element('span','fg-state '+(note.status==='proposed'?'fg-proposed':note.status==='effective'?'fg-effective':''),note.status==='proposed'?'Proposed — not final':note.status==='effective'?'Effective source':'Project update'),element('span','',note.effectiveDate?'Effective '+note.effectiveDate:note.sourceDate?'Source '+note.sourceDate:note.date||''));
      article.append(meta,element('h2','',note.title),element('p','',note.summary));
      if(note.details?.length){const d=element('details');d.append(element('summary','','Details'));const list=element('ul');note.details.forEach(text=>list.append(element('li','',text)));d.append(list);article.append(d);}
      const links=element('div','update-links');(note.links||[]).forEach(s=>{const a=link(s.label,s.url);if(a)links.append(a);});article.append(links);
      (note.entryIds||[]).forEach(id=>{if(state.byId.has(id)){const b=element('button','','Compare '+state.byId.get(id).title);b.type='button';b.addEventListener('click',()=>openEntry(id,true));article.append(b);}});$('releaseNotes').append(article);
    }
  }
  async function load() {
    $('loadError').hidden=true;document.querySelector('[data-screen=compare]').setAttribute('aria-busy','true');
    try {
      const responses=await Promise.all([fetch('../kb.json',{cache:'no-cache'}),fetch('../updates.json',{cache:'no-cache'}),fetch('./mappings.json',{cache:'no-cache'})]);
      if(responses.some(r=>!r.ok))throw new Error('Knowledge-base request failed. Check your connection and retry.');
      const [base,updates,mappings]=await Promise.all(responses.map(r=>r.json()));
      if(!Array.isArray(base.entries)||!Array.isArray(updates.entries)||!updates.meta)throw new Error('Invalid knowledge-base format.');
      const map=new Map(base.entries.map(e=>[e.id,e]));updates.entries.forEach(e=>map.set(e.id,e));for(const [id,patch] of Object.entries(mappings.entries||{})){if(map.has(id))map.set(id,{...map.get(id),...patch});}state.entries=[...map.values()];state.byId=map;state.meta=updates.meta;
      state.entries.forEach(e=>{e.summary=e.summary||'';e.searchText=[...searchFields(e).map(x=>x.text),e.group,...e.keywords||[]].filter(Boolean).join(' ').toLowerCase();});
      $('dataStatus').textContent=state.entries.length.toLocaleString()+' sections · reviewed '+state.meta.lastUpdated;
      buildGroups();search();renderUpdates();
      let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{id='';}
      openEntry(state.byId.has(id)?id:state.entries[0].id);
      document.querySelector('[data-screen=compare]').setAttribute('aria-busy','false');
    } catch(error) {$('loadError').hidden=false;$('errorText').textContent=error.message;all('[data-screen]').forEach(e=>e.hidden=true);$('resultCount').textContent='Data unavailable';announce('Unable to load knowledge base.');}
  }
  try {const stored=JSON.parse(localStorage.getItem('forge-alt-saved')||'[]');if(Array.isArray(stored))state.saved=new Set(stored.filter(x=>typeof x==='string'));const theme=localStorage.getItem('forge-alt-theme');if(['light','dark'].includes(theme))document.documentElement.dataset.theme=theme;} catch { /* Storage is optional. */ }
  all('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
  all('[data-detail]').forEach(b=>b.addEventListener('click',()=>{state.detail=b.dataset.detail;renderEntry();}));all('[data-layout]').forEach(b=>b.addEventListener('click',()=>{state.layout=b.dataset.layout;renderEntry();}));
  ['changesOnly','highlight'].forEach(id=>$(id).addEventListener('change',renderEntry));
  let searchTimer;$('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{$('reg').value='all';$('group').value='';$('savedOnly').checked=false;buildGroups();search();if($('search').value.trim())showPage('search');else showPage('compare');},120);});$('reg').addEventListener('change',()=>{$('group').value='';buildGroups();search();});$('group').addEventListener('change',()=>search());$('savedOnly').addEventListener('change',()=>search());
  $('clear').addEventListener('click',()=>{$('search').value='';$('reg').value='all';$('group').value='';$('savedOnly').checked=false;buildGroups();search();showPage('compare');});
  $('prev').addEventListener('click',()=>{state.page--;search(false);});$('next').addEventListener('click',()=>{state.page++;search(false);});
  $('save').addEventListener('click',()=>{if(!state.entry)return;const id=state.entry.id;state.saved.has(id)?state.saved.delete(id):state.saved.add(id);let persisted=true;try{localStorage.setItem('forge-alt-saved',JSON.stringify([...state.saved]));}catch{persisted=false;}renderEntry();search(false);announce((state.saved.has(id)?'Section saved':'Section removed from saved')+(persisted?' on this device.':' for this session only; device storage is unavailable.'));});
  $('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);announce('Section link copied.');}catch{announce('Copy is unavailable. Select and copy the address-bar link.');}});$('print').addEventListener('click',()=>window.print());
  $('theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem('forge-alt-theme',document.documentElement.dataset.theme);}catch{}announce('Switched to '+document.documentElement.dataset.theme+' theme.');});
  $('retry').addEventListener('click',()=>{showPage('compare');load();});window.addEventListener('hashchange',()=>{try{openEntry(decodeURIComponent(location.hash.slice(1)));}catch{}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
  function syncTheme(){const dark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&window.matchMedia('(prefers-color-scheme: dark)').matches);$('theme').textContent=dark?'☀ Switch to Light':'☾ Switch to Dark';$('theme').setAttribute('aria-label',$('theme').textContent);}
  $('theme').addEventListener('click',syncTheme);syncTheme();
  RESOURCES.forEach(r=>{const a=link(r.label,r.url);if(a)$('resourceLinks').append(a);});
  const guide=$('welcome');let guideFocus;
  function openGuide(){guideFocus=document.activeElement;if(guide.showModal)guide.showModal();else guide.setAttribute('open','');$('startGuide').focus();}
  function closeGuide(){if(guide.close)guide.close();else guide.removeAttribute('open');try{localStorage.setItem('forge-alt-guide-v1','seen');}catch{}guideFocus?.focus();}
  $('help').addEventListener('click',openGuide);$('closeGuide').addEventListener('click',closeGuide);$('startGuide').addEventListener('click',closeGuide);guide.addEventListener('cancel',e=>{e.preventDefault();closeGuide();});
  try{if(localStorage.getItem('forge-alt-guide-v1')!=='seen')openGuide();}catch{openGuide();}
  function askOpen(open){$('askPanel').hidden=!open;$('askToggle').setAttribute('aria-expanded',String(open));(open?$('askInput'):$('askToggle')).focus();}
  $('askToggle').addEventListener('click',()=>askOpen($('askPanel').hidden));$('askClose').addEventListener('click',()=>askOpen(false));$('askPanel').addEventListener('keydown',e=>{if(e.key==='Escape')askOpen(false);});
  $('askForm').addEventListener('submit',e=>{e.preventDefault();const query=$('askInput').value.trim();const stop=new Set(['what','is','the','a','an','for','how','do','does','when','are','to','of','in','about','tell','me','and','can']);const terms=query.toLowerCase().split(/[^a-z0-9.-]+/).filter(t=>t&&!stop.has(t));const ranked=state.entries.map(entry=>({entry,score:terms.reduce((n,t)=>n+(entry.searchText.includes(t)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);$('askResults').replaceChildren();if(!terms.length||!ranked.length){$('askResults').append(element('p','','No relevant stored excerpt found. Try a citation or a specific topic.'));return;} $('askResults').append(element('p','fg-small','Closest stored sections — verify the complete source and applicability.'));ranked.slice(0,5).forEach(x=>$('askResults').append(resultButton(x.entry,terms.join(' '))));});
  load();if('serviceWorker'  in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
