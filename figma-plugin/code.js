// LoanBud CRM — Figma Plugin (Fully Editable Frames)
// Creates Components page + 5 user-flow pages from Figma primitives.

// ─── Color tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:    '#0d5e52',
  sidebar:    '#053f4f',
  sidebarAct: '#4ade80',
  accent:     '#fbbf24',
  bg:         '#fafafa',
  card:       '#ffffff',
  border:     '#e5e7eb',
  muted:      '#f5f5f5',
  mutedFg:    '#6b7280',
  fg:         '#0f1419',
  fg2:        '#374151',
  white:      '#ffffff',
  black:      '#000000',
  leads:      { dot:'#60a5fa', bg:'#eff6ff', fg:'#1d4ed8' },
  preqReview: { dot:'#a855f7', bg:'#faf5ff', fg:'#7e22ce' },
  completed:  { dot:'#14b8a6', bg:'#f0fdfa', fg:'#0f766e' },
  submitted:  { dot:'#fb923c', bg:'#fff7ed', fg:'#c2410c' },
  prepaid:    { dot:'#eab308', bg:'#fefce8', fg:'#a16207' },
  onHold:     { dot:'#78716c', bg:'#f5f5f4', fg:'#57534e' },
  withdrawn:  { dot:'#f87171', bg:'#fef2f2', fg:'#b91c1c' },
  funded:     { dot:'#22c55e', bg:'#f0fdf4', fg:'#15803d' },
  active:     { bg:'#dcfce7', fg:'#15803d' },
  draft:      { bg:'#f3f4f6', fg:'#6b7280' },
  paused:     { bg:'#fef9c3', fg:'#a16207' },
};

function c(hex, a) {
  const h = hex.replace('#','');
  const col = { r:parseInt(h.slice(0,2),16)/255, g:parseInt(h.slice(2,4),16)/255, b:parseInt(h.slice(4,6),16)/255 };
  return a !== undefined ? [{ type:'SOLID', color:col, opacity:a }] : [{ type:'SOLID', color:col }];
}
const noFill = () => [];

async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family:'Inter', style:'Regular' }),
    figma.loadFontAsync({ family:'Inter', style:'Medium' }),
    figma.loadFontAsync({ family:'Inter', style:'Semi Bold' }),
    figma.loadFontAsync({ family:'Inter', style:'Bold' }),
  ]);
}

function fr(w, h, fill, radius) {
  const f = figma.createFrame();
  f.resize(w, h);
  f.fills = fill ? c(fill) : noFill();
  if (radius) f.cornerRadius = radius;
  f.clipsContent = true;
  return f;
}

function rc(w, h, fill, radius) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = fill ? c(fill) : noFill();
  if (radius) r.cornerRadius = radius;
  return r;
}

function el(size, fill) {
  const e = figma.createEllipse();
  e.resize(size, size);
  e.fills = fill ? c(fill) : noFill();
  return e;
}

function tx(str, sz, wt, fill, maxW) {
  const t = figma.createText();
  const style = wt >= 700 ? 'Bold' : wt >= 600 ? 'Semi Bold' : wt >= 500 ? 'Medium' : 'Regular';
  t.fontName = { family:'Inter', style };
  t.fontSize = sz;
  t.fills = fill ? c(fill) : c(T.fg);
  if (maxW) { t.textAutoResize = 'HEIGHT'; t.resize(maxW, 20); }
  else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.characters = str;
  return t;
}

function place(parent, child, x, y) {
  parent.appendChild(child);
  child.x = x;
  child.y = y;
}

// ─── Compound components ──────────────────────────────────────────────────────

function chip(label, bg, fg, dot) {
  const wrap = figma.createFrame();
  wrap.layoutMode = 'HORIZONTAL';
  wrap.counterAxisAlignItems = 'CENTER';
  wrap.paddingLeft = wrap.paddingRight = 8;
  wrap.paddingTop = wrap.paddingBottom = 3;
  wrap.itemSpacing = 5;
  wrap.cornerRadius = 999;
  wrap.fills = c(bg);
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'AUTO';
  if (dot) { const d = el(6, dot); wrap.appendChild(d); }
  const t = figma.createText();
  t.fontName = { family:'Inter', style:'Medium' };
  t.fontSize = 11;
  t.fills = c(fg);
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.characters = label;
  wrap.appendChild(t);
  return wrap;
}

function badge(label, bg, fg) {
  const wrap = figma.createFrame();
  wrap.layoutMode = 'HORIZONTAL';
  wrap.counterAxisAlignItems = 'CENTER';
  wrap.paddingLeft = wrap.paddingRight = 8;
  wrap.paddingTop = wrap.paddingBottom = 2;
  wrap.cornerRadius = 6;
  wrap.fills = c(bg);
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'AUTO';
  const t = figma.createText();
  t.fontName = { family:'Inter', style:'Medium' };
  t.fontSize = 11;
  t.fills = c(fg);
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.characters = label;
  wrap.appendChild(t);
  return wrap;
}

function btn(label, bg, fg, border) {
  const wrap = figma.createFrame();
  wrap.layoutMode = 'HORIZONTAL';
  wrap.counterAxisAlignItems = 'CENTER';
  wrap.primaryAxisAlignItems = 'CENTER';
  wrap.paddingLeft = wrap.paddingRight = 14;
  wrap.paddingTop = wrap.paddingBottom = 0;
  wrap.cornerRadius = 8;
  wrap.fills = bg ? c(bg) : noFill();
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'FIXED';
  wrap.resize(wrap.width, 34);
  if (border) { wrap.strokes = c(border); wrap.strokeWeight = 1; wrap.strokeAlign = 'INSIDE'; }
  const t = figma.createText();
  t.fontName = { family:'Inter', style:'Medium' };
  t.fontSize = 13;
  t.fills = fg ? c(fg) : c(T.fg);
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.characters = label;
  wrap.appendChild(t);
  return wrap;
}

function searchInput(placeholder, w) {
  const wrap = fr(w, 34, T.card, 8);
  wrap.strokes = c(T.border);
  wrap.strokeWeight = 1;
  wrap.strokeAlign = 'INSIDE';
  place(wrap, tx('⌕', 14, 400, T.mutedFg), 10, 9);
  place(wrap, tx(placeholder, 13, 400, T.mutedFg), 30, 10);
  return wrap;
}

function avatar(initials, bg, size) {
  size = size || 28;
  const wrap = fr(size, size, bg || '#6366f1', size/2);
  const t = figma.createText();
  t.fontName = { family:'Inter', style:'Semi Bold' };
  t.fontSize = size <= 28 ? 10 : 13;
  t.fills = c(T.white);
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.characters = initials;
  wrap.appendChild(t);
  t.x = Math.round((size - t.width) / 2);
  t.y = Math.round((size - t.height) / 2);
  return wrap;
}

// ─── Table helpers ─────────────────────────────────────────────────────────────

function tableHeaderRow(cols, w) {
  const row = fr(w, 36, '#f9fafb');
  row.strokes = c(T.border);
  row.strokeWeight = 1;
  row.strokeAlign = 'INSIDE';
  let x = 16;
  for (const col of cols) {
    if (col.label) {
      const t = tx(col.label.toUpperCase(), 10, 600, T.mutedFg);
      t.letterSpacing = { value:0.5, unit:'PIXELS' };
      place(row, t, x, 12);
    }
    x += col.w;
  }
  return row;
}

function tableRow(cells, cols, w, bg) {
  const row = fr(w, 48, bg || T.card);
  const sep = rc(w, 1, T.border);
  sep.y = 47; row.appendChild(sep);
  let x = 16;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const colW = cols[i] ? cols[i].w : 120;
    if (!cell || cell === '') { x += colW; continue; }
    if (typeof cell === 'string') {
      place(row, tx(cell, 13, 400, T.fg2), x, 16);
    } else if (cell.type === 'chip') {
      const ch = chip(cell.label, cell.bg, cell.fg, cell.dot);
      place(row, ch, x, 13);
    } else if (cell.type === 'badge') {
      const b = badge(cell.label, cell.bg, cell.fg);
      place(row, b, x, 14);
    } else if (cell.type === 'avatar') {
      const av = avatar(cell.initials, cell.bg);
      place(row, av, x, 10);
      if (cell.name) {
        place(row, tx(cell.name, 13, 500, T.fg), x + 34, 9);
        if (cell.sub) place(row, tx(cell.sub, 11, 400, T.mutedFg), x + 34, 27);
      }
    } else if (cell.type === 'dot') {
      const d = el(8, cell.color);
      place(row, d, x, 20);
    }
    x += colW;
  }
  return row;
}

function tabBar(tabs, activeIdx, w) {
  const bar = fr(w, 40, T.card);
  bar.strokes = c(T.border);
  bar.strokeWeight = 1;
  bar.strokeAlign = 'INSIDE';
  let x = 16;
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const isActive = i === activeIdx;
    const label = tab.count !== undefined ? tab.label + ' (' + tab.count + ')' : tab.label;
    const t = tx(label, 13, isActive ? 500 : 400, isActive ? T.primary : T.mutedFg);
    place(bar, t, x, 12);
    if (isActive) {
      const ul = rc(t.width, 2, T.primary, 1);
      place(bar, ul, x, 38);
    }
    x += t.width + 24;
  }
  return bar;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function makeSidebar(activeItem) {
  const sb = fr(220, 900, T.sidebar);
  sb.name = 'Sidebar';

  const header = fr(220, 56, T.sidebar);
  header.fills = c(T.sidebar);
  const sep = rc(220, 1, T.white, 0); sep.fills = c(T.white, 0.1); sep.y = 55;
  header.appendChild(sep);
  const logoCircle = el(22, T.accent); logoCircle.x = 18; logoCircle.y = 17;
  header.appendChild(logoCircle);
  const logoTx = tx('LoanBud', 15, 600, T.white); logoTx.x = 46; logoTx.y = 20;
  header.appendChild(logoTx);
  place(sb, header, 0, 0);

  const sections = [
    { type:'section', label:'APPLICATIONS', y:68 },
    { type:'item', id:'applications',   label:'Applications',         y:88  },
    { type:'item', id:'bizacq',         label:'Business Acquisition', y:124 },
    { type:'section', label:'FEATURES', y:162 },
    { type:'item', id:'crm',            label:'CRM',                  y:180, arrow:true },
    { type:'item', id:'workflow',       label:'Workflow',              y:216, arrow:true },
    { type:'item', id:'users',          label:'Users',                 y:252 },
    { type:'item', id:'automations',    label:'Automations',           y:288 },
    { type:'item', id:'questionnaires', label:'Questionnaires',        y:324 },
    { type:'item', id:'configurations', label:'Configurations',        y:360 },
  ];

  for (const s of sections) {
    if (s.type === 'section') {
      const lbl = tx(s.label, 9, 600, T.white);
      lbl.fills = c(T.white, 0.35);
      lbl.characters = s.label;
      lbl.letterSpacing = { value:1, unit:'PIXELS' };
      place(sb, lbl, 18, s.y);
    } else {
      const isActive = s.id === activeItem;
      if (isActive) {
        const activeBg = rc(196, 32, T.sidebarAct, 8);
        activeBg.fills = c(T.sidebarAct, 0.15);
        activeBg.strokes = c(T.sidebarAct, 0.3);
        activeBg.strokeWeight = 1;
        activeBg.strokeAlign = 'INSIDE';
        place(sb, activeBg, 12, s.y);
      }
      const dot = rc(3, 16, isActive ? T.sidebarAct : T.sidebar, 2);
      dot.fills = isActive ? c(T.sidebarAct) : noFill();
      place(sb, dot, 12, s.y + 8);
      const lbl = tx(s.label, 13, isActive ? 500 : 400, isActive ? T.sidebarAct : T.white);
      lbl.fills = isActive ? c(T.sidebarAct) : c(T.white, 0.7);
      lbl.characters = s.label;
      place(sb, lbl, 28, s.y + 8);
      if (s.arrow) {
        const arrow = tx('›', 14, 400, T.white);
        arrow.fills = c(T.white, 0.4);
        arrow.characters = '›';
        place(sb, arrow, 196, s.y + 8);
      }
    }
  }
  return sb;
}

// ─── App Header ───────────────────────────────────────────────────────────────

function makeHeader(title, w) {
  const h = fr(w, 48, T.card);
  h.name = 'AppHeader';
  h.strokes = c(T.border);
  h.strokeWeight = 1;
  h.strokeAlign = 'OUTSIDE';
  place(h, tx(title, 14, 500, T.fg), 24, 16);
  const av = avatar('JD', '#6366f1', 28);
  place(h, av, w - 110, 10);
  const userTx = tx('John Doe', 12, 400, T.fg2);
  place(h, userTx, w - 78, 16);
  return h;
}

// ─── Screen wrapper ───────────────────────────────────────────────────────────

function makeScreen(name, activeNav) {
  const screen = fr(1440, 900, T.bg);
  screen.name = name;
  place(screen, makeSidebar(activeNav), 0, 0);
  place(screen, makeHeader(name, 1220), 220, 0);
  return screen;
}

// ─── Screen builders ──────────────────────────────────────────────────────────

function buildApplications() {
  const screen = makeScreen('Applications', 'applications');
  const cx = 220, cy = 48, cw = 1220;

  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search applications…', 280), 16, 9);
  const exportBtn = btn('Export', null, T.mutedFg, T.border);
  place(toolbar, exportBtn, cw - exportBtn.width - 120, 9);
  const newBtn = btn('+ New Application', T.primary, T.white);
  place(toolbar, newBtn, cw - newBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);

  place(screen, tabBar([
    {label:'All',count:87},{label:'Leads',count:23},{label:'Prequalification',count:15},
    {label:'Completed Initial',count:12},{label:'Submitted',count:8},{label:'On Hold',count:5},{label:'Funded',count:9},
  ], 0, cw), cx, cy + 52);

  const cols = [
    {label:'',w:44},{label:'App #',w:100},{label:'Stage',w:190},{label:'Loan Purpose',w:160},
    {label:'Branch',w:160},{label:'Loan Officer',w:160},{label:'Amount',w:120},{label:'Created',w:100},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 92);

  const stageColors = [T.leads, T.preqReview, T.submitted, T.funded, T.onHold, T.leads];
  const stageLabels = ['Leads','Prequalification','Submitted','Funded','On Hold','Leads'];
  const appData = [
    ['APP-10234','Purchase','HQ Branch','Sarah Chen','$485,000','Jan 12'],
    ['APP-10233','Refinance','West Branch','Mike Torres','$320,000','Jan 11'],
    ['APP-10232','Purchase','East Branch','Lisa Park','$675,000','Jan 10'],
    ['APP-10231','Purchase','HQ Branch','David Wu','$290,000','Jan 9'],
    ['APP-10230','Refinance','South Branch','Emma Reid','$540,000','Jan 8'],
    ['APP-10229','Purchase','North Branch','Tom Blake','$412,000','Jan 7'],
  ];
  appData.forEach((row, i) => {
    place(screen, tableRow([
      {type:'dot',color:'#e5e7eb'}, row[0],
      {type:'chip',label:stageLabels[i],bg:stageColors[i].bg,fg:stageColors[i].fg,dot:stageColors[i].dot},
      row[1],row[2],row[3],row[4],row[5],
    ], cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy + 128 + i * 48);
  });
  return screen;
}

function buildBusinessAcquisition() {
  const screen = makeScreen('Business Acquisition', 'bizacq');
  const cx = 220, cy = 48, cw = 1220;
  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search records…', 280), 16, 9);
  const newBtn = btn('+ New Record', T.primary, T.white);
  place(toolbar, newBtn, cw - newBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);
  place(screen, tabBar([
    {label:'All',count:64},{label:'Prospecting',count:18},{label:'Proposal Sent',count:12},
    {label:'Contract Signed',count:8},{label:'Funded',count:15},{label:'Lost',count:11},
  ], 0, cw), cx, cy + 52);
  const cols = [
    {label:'',w:44},{label:'Company',w:200},{label:'Stage',w:170},{label:'Contact',w:160},
    {label:'Deal Size',w:120},{label:'Source',w:140},{label:'Assigned To',w:140},{label:'Last Activity',w:120},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 92);
  const rows = [
    [{type:'dot',color:'#e5e7eb'},'Apex Realty Group',{type:'chip',label:'Contract Signed',bg:T.completed.bg,fg:T.completed.fg,dot:T.completed.dot},'J. Martinez','$2.4M','Referral','Sarah Chen','Jan 14'],
    [{type:'dot',color:'#e5e7eb'},'BlueSky Mortgage',{type:'chip',label:'Proposal Sent',bg:T.preqReview.bg,fg:T.preqReview.fg,dot:T.preqReview.dot},'A. Thompson','$1.8M','Cold Outreach','Mike Torres','Jan 13'],
    [{type:'dot',color:'#e5e7eb'},'Summit Real Estate',{type:'chip',label:'Prospecting',bg:T.leads.bg,fg:T.leads.fg,dot:T.leads.dot},'C. Wilson','$3.1M','LinkedIn','Lisa Park','Jan 12'],
    [{type:'dot',color:'#e5e7eb'},'Horizon Partners',{type:'chip',label:'Funded',bg:T.funded.bg,fg:T.funded.fg,dot:T.funded.dot},'R. Nakamura','$980K','Event','David Wu','Jan 10'],
    [{type:'dot',color:'#e5e7eb'},'Coastal Lending',{type:'chip',label:'Lost',bg:T.withdrawn.bg,fg:T.withdrawn.fg,dot:T.withdrawn.dot},'M. OBrien','$1.2M','Referral','Emma Reid','Jan 8'],
  ];
  rows.forEach((row,i) => place(screen, tableRow(row, cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy+128+i*48));
  return screen;
}

function buildCRMContacts() {
  const screen = makeScreen('Contacts', 'crm');
  const cx = 220, cy = 48, cw = 1220;
  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search by name, email, listing…', 300), 16, 9);
  const addBtn = btn('+ Add Contact', T.primary, T.white);
  place(toolbar, addBtn, cw - addBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);
  place(screen, tabBar([
    {label:'All Contacts',count:1284},{label:'Brokers',count:342},
    {label:'Partners',count:218},{label:'Saved Views',count:5},
  ], 0, cw), cx, cy + 52);
  const cols = [
    {label:'',w:44},{label:'Name',w:220},{label:'Email',w:220},{label:'Phone',w:140},
    {label:'Listing',w:200},{label:'Type',w:120},{label:'Status',w:120},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 92);
  const avColors = ['#6366f1','#0891b2','#d97706','#7c3aed','#059669','#dc2626'];
  const contacts = [
    {ii:'JM',name:'James Martinez',email:'j.martinez@apexrealty.com',phone:'(555) 291-8834',listing:'Oakwood Heights #4B',type:'Broker',status:'Active'},
    {ii:'AT',name:'Amanda Thompson',email:'a.thompson@blue.com',phone:'(555) 843-2291',listing:'Riverside Condos #12',type:'Partner',status:'Active'},
    {ii:'CW',name:'Chris Wilson',email:'c.wilson@summit.com',phone:'(555) 672-5510',listing:'Summit Villas #7',type:'Broker',status:'Inactive'},
    {ii:'RN',name:'Rachel Nakamura',email:'r.nakamura@horizon.co',phone:'(555) 104-9873',listing:'Harbor View #3A',type:'Partner',status:'Active'},
    {ii:'MO',name:'Mark OBrien',email:'m.obrien@coastal.com',phone:'(555) 358-6629',listing:'Coastal Pines #22',type:'Broker',status:'Active'},
    {ii:'LP',name:'Linda Park',email:'l.park@westside.com',phone:'(555) 912-4477',listing:'Westside Terrace #9',type:'Partner',status:'Opted Out'},
  ];
  contacts.forEach((ct, i) => {
    const stBg = ct.status==='Active'?'#f0fdf4':ct.status==='Opted Out'?'#fef2f2':'#f3f4f6';
    const stFg = ct.status==='Active'?'#15803d':ct.status==='Opted Out'?'#b91c1c':'#6b7280';
    const tpBg = ct.type==='Broker'?'#eff6ff':'#f5f3ff';
    const tpFg = ct.type==='Broker'?'#1d4ed8':'#7e22ce';
    place(screen, tableRow([
      {type:'dot',color:'#e5e7eb'},
      {type:'avatar',initials:ct.ii,bg:avColors[i],name:ct.name,sub:ct.email},
      '',ct.phone,ct.listing,
      {type:'badge',label:ct.type,bg:tpBg,fg:tpFg},
      {type:'badge',label:ct.status,bg:stBg,fg:stFg},
    ], cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy+128+i*48);
  });
  return screen;
}

function buildContactDetail() {
  const screen = makeScreen('Contact Detail', 'crm');
  const cx = 220, cy = 48, cw = 1220;

  const left = fr(360, 852, T.card);
  left.strokes = c(T.border); left.strokeWeight = 1; left.strokeAlign = 'INSIDE';
  const av = avatar('JM', '#6366f1', 56);
  place(left, av, 152, 32);
  const nameT = tx('James Martinez', 18, 600, T.fg);
  nameT.x = Math.round((360 - nameT.width)/2); nameT.y = 96;
  left.appendChild(nameT);
  const typeBadge = badge('Broker','#eff6ff','#1d4ed8');
  left.appendChild(typeBadge);
  typeBadge.x = Math.round((360 - typeBadge.width)/2); typeBadge.y = 122;
  const fields = [
    {label:'Email',value:'j.martinez@apexrealty.com'},
    {label:'Phone',value:'(555) 291-8834'},
    {label:'Listing',value:'Oakwood Heights #4B'},
    {label:'Listing Status',value:'Active'},
    {label:'Open Reminders',value:'3 tasks due'},
  ];
  let fy = 164;
  place(left, rc(320, 1, T.border), 20, fy-8);
  for (const f of fields) {
    place(left, tx(f.label, 10, 600, T.mutedFg), 20, fy);
    place(left, tx(f.value, 13, 400, T.fg2), 20, fy+14);
    place(left, rc(320, 1, T.border), 20, fy+34);
    fy += 52;
  }
  const tagsL = tx('TAGS', 10, 600, T.mutedFg); tagsL.x = 20; tagsL.y = fy;
  left.appendChild(tagsL);
  fy += 18;
  let tgX = 20;
  for (const tag of ['VIP','Purchase','Pre-approved']) {
    const tb = badge(tag, T.muted, T.fg2);
    left.appendChild(tb); tb.x = tgX; tb.y = fy; tgX += tb.width + 8;
  }
  place(screen, left, cx, cy);

  const right = fr(860, 852, T.bg);
  place(screen, right, cx + 360, cy);
  right.appendChild(tabBar([{label:'Overview'},{label:'Activity'},{label:'Tasks'},{label:'Enrollments'}], 1, 860));
  const activities = [
    {icon:'📧',text:'Email sent: Pre-approval Status Update',time:'2 hours ago',col:'#eff6ff'},
    {icon:'📞',text:'Call completed — 4m 32s',time:'Yesterday',col:'#f0fdf4'},
    {icon:'✓', text:'Task completed: Follow-up call',time:'Jan 12',col:'#f5f3ff'},
    {icon:'📧',text:'Email sent: Welcome to LoanBud',time:'Jan 10',col:'#eff6ff'},
    {icon:'📝',text:'Note added by Sarah Chen',time:'Jan 9',col:'#fefce8'},
  ];
  let ay = 56;
  for (const act of activities) {
    const card = fr(820, 52, T.card, 8);
    card.strokes = c(T.border); card.strokeWeight = 1; card.strokeAlign = 'INSIDE';
    const dot = el(28, act.col); place(card, dot, 12, 12);
    place(card, tx(act.icon, 13, 400, T.fg), 19, 19);
    place(card, tx(act.text, 13, 400, T.fg2), 52, 12);
    place(card, tx(act.time, 11, 400, T.mutedFg), 52, 30);
    card.x = 20; card.y = ay;
    right.appendChild(card);
    ay += 60;
  }
  return screen;
}

function buildTaskQueue() {
  const screen = makeScreen('Task Queue', 'crm');
  const cx = 220, cy = 48, cw = 1220;
  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search tasks…', 260), 16, 9);
  const sortBtn = btn('Sort: Due Date ▾', null, T.mutedFg, T.border);
  place(toolbar, sortBtn, cw - sortBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);
  place(screen, tabBar([
    {label:'Today',count:8},{label:'This Week',count:24},{label:'Overdue',count:5},{label:'All Tasks',count:87},
  ], 0, cw), cx, cy + 52);
  const cols = [
    {label:'',w:44},{label:'Contact',w:200},{label:'Task Type',w:160},{label:'Source',w:160},
    {label:'Due',w:120},{label:'Assignee',w:140},{label:'Status',w:120},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 92);
  const avColors = ['#6366f1','#0891b2','#d97706','#7c3aed','#059669'];
  const tasks = [
    {ii:'JM',name:'James Martinez',sub:'Broker',type:'Call Reminder',src:'Workflow: Pre-approval',due:'Today 2pm',by:'Sarah Chen'},
    {ii:'AT',name:'Amanda Thompson',sub:'Partner',type:'Email Task',src:'Workflow: Welcome',due:'Today 4pm',by:'Mike Torres'},
    {ii:'CW',name:'Chris Wilson',sub:'Broker',type:'Follow-up Call',src:'Manual',due:'Today 5pm',by:'Lisa Park'},
    {ii:'RN',name:'Rachel Nakamura',sub:'Partner',type:'Send Docs',src:'Workflow: Docs',due:'Tomorrow',by:'David Wu'},
    {ii:'MO',name:'Mark OBrien',sub:'Broker',type:'Check-in Call',src:'Manual',due:'Tomorrow',by:'Emma Reid'},
  ];
  tasks.forEach((t,i) => place(screen, tableRow([
    {type:'dot',color:'#e5e7eb'},
    {type:'avatar',initials:t.ii,bg:avColors[i],name:t.name,sub:t.sub},
    t.type, t.src, t.due, t.by,
    {type:'badge',label:'Pending',bg:'#fef9c3',fg:'#a16207'},
  ], cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy+128+i*48));
  return screen;
}

function buildWorkflowList() {
  const screen = makeScreen('Workflows', 'workflow');
  const cx = 220, cy = 48, cw = 1220;
  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search workflows…', 280), 16, 9);
  const newBtn = btn('+ New Flow', T.primary, T.white);
  place(toolbar, newBtn, cw - newBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);
  const cols = [
    {label:'Name',w:280},{label:'Status',w:120},{label:'Enrolled',w:120},
    {label:'Steps',w:80},{label:'Segment',w:220},{label:'Created',w:120},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 52);
  const wfs = [
    {n:'New Lead Welcome Sequence',s:'active',e:142,st:5,seg:'New Leads',d:'Dec 12'},
    {n:'Pre-Approval Follow-up',s:'active',e:87,st:7,seg:'Pre-Approval Ready',d:'Dec 8'},
    {n:'Post-Closing Check-in',s:'paused',e:0,st:3,seg:'Funded 30d',d:'Nov 28'},
    {n:'Re-engagement Campaign',s:'draft',e:0,st:4,seg:'Inactive 90d',d:'Nov 15'},
    {n:'Document Request Flow',s:'active',e:34,st:6,seg:'Submitted',d:'Nov 3'},
    {n:'Rate Alert Sequence',s:'active',e:218,st:2,seg:'All Contacts',d:'Oct 20'},
  ];
  const avBgs = ['#6366f1','#0891b2','#d97706','#7c3aed','#059669','#dc2626'];
  wfs.forEach((wf,i) => {
    const st = T[wf.s];
    place(screen, tableRow([
      {type:'avatar',initials:wf.n.slice(0,2).toUpperCase(),bg:avBgs[i],name:wf.n},
      {type:'badge',label:wf.s.charAt(0).toUpperCase()+wf.s.slice(1),bg:st.bg,fg:st.fg},
      wf.e+' contacts', wf.st+' steps', wf.seg, wf.d,
    ], cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy+88+i*48);
  });
  return screen;
}

function buildWorkflowBuilder() {
  const screen = makeScreen('Workflow Builder', 'workflow');
  const cx = 220, cy = 48, cw = 1220;

  const stepsPanel = fr(300, 852, T.card);
  stepsPanel.strokes = c(T.border); stepsPanel.strokeWeight = 1; stepsPanel.strokeAlign = 'INSIDE';
  place(stepsPanel, tx('Flow Steps', 14, 600, T.fg), 16, 16);
  const steps = [
    {day:0, type:'Email', name:'Welcome Email', icon:'📧'},
    {day:3, type:'Delay', name:'Wait 3 days', icon:'⏱'},
    {day:3, type:'SMS', name:'Follow-up Text', icon:'💬'},
    {day:7, type:'Call Reminder', name:'Check-in Call', icon:'📞'},
    {day:14,type:'Email', name:'Rate Update Email',icon:'📧'},
  ];
  let sy = 52;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (i > 0) { const ln = rc(2,16,T.border); place(stepsPanel, ln, 25, sy-16); }
    const card = fr(268, 60, i===0?T.bg:T.muted, 10);
    if (i===0) { card.strokes = c(T.primary,0.4); card.strokeWeight = 1; card.strokeAlign='INSIDE'; }
    place(card, tx(s.icon, 16, 400, T.fg), 10, 20);
    place(card, tx(s.type, 10, 600, T.mutedFg), 34, 10);
    place(card, tx(s.name, 13, 500, T.fg), 34, 24);
    place(card, tx('Day '+s.day, 11, 400, T.mutedFg), 34, 42);
    place(stepsPanel, card, 16, sy);
    sy += 76;
  }
  const addBtn = btn('+ Add Step', null, T.primary, T.primary);
  place(stepsPanel, addBtn, 16, sy + 8);
  place(screen, stepsPanel, cx, cy);

  const editor = fr(920, 852, T.bg);
  place(screen, editor, cx + 300, cy);
  place(editor, tx('Welcome Email', 20, 600, T.fg), 32, 32);

  const formFields = [
    {label:'Email Template', value:'New Lead Welcome v2'},
    {label:'Subject Line', value:'Welcome to LoanBud, {{firstName}}!'},
    {label:'From Name', value:'Sarah Chen'},
    {label:'Day Offset', value:'0 (send immediately)'},
  ];
  let ffy = 72;
  for (const f of formFields) {
    place(editor, tx(f.label, 12, 500, T.fg2), 32, ffy);
    const inp = fr(500, 36, T.card, 8);
    inp.strokes = c(T.border); inp.strokeWeight = 1; inp.strokeAlign = 'INSIDE';
    place(inp, tx(f.value, 13, 400, T.fg2), 12, 10);
    place(editor, inp, 32, ffy + 18);
    ffy += 68;
  }
  place(editor, tx('Outcome Rules', 15, 600, T.fg), 32, ffy + 8);
  const rules = ['If Email Opened → Wait 2 days → Send SMS','If No Open in 3 days → Tag as cold lead'];
  for (const rule of rules) {
    ffy += 32;
    const ruleBg = fr(500, 36, '#f0fdf4', 8);
    ruleBg.strokes = c('#86efac'); ruleBg.strokeWeight = 1; ruleBg.strokeAlign = 'INSIDE';
    place(ruleBg, tx(rule, 12, 400, '#15803d'), 12, 10);
    place(editor, ruleBg, 32, ffy + 8);
    ffy += 24;
  }
  return screen;
}

function buildWorkflowBoard() {
  const screen = makeScreen('Workflow Board', 'workflow');
  const cx = 220, cy = 48, cw = 1220;
  const selectBar = fr(cw, 48, T.card);
  selectBar.strokes = c(T.border); selectBar.strokeWeight = 1; selectBar.strokeAlign = 'INSIDE';
  const wfSel = fr(260, 32, T.muted, 8);
  wfSel.strokes = c(T.border); wfSel.strokeWeight = 1; wfSel.strokeAlign = 'INSIDE';
  place(wfSel, tx('New Lead Welcome Sequence ▾', 12, 400, T.fg2), 10, 8);
  place(selectBar, wfSel, 16, 8);
  place(selectBar, tx('142 contacts enrolled', 13, 400, T.mutedFg), 288, 16);
  place(screen, selectBar, cx, cy);
  const columns = [
    {title:'Welcome Email',count:48,col:'#eff6ff'},
    {title:'Wait 3 days',count:23,col:'#fefce8'},
    {title:'Follow-up Text',count:31,col:'#f5f3ff'},
    {title:'Check-in Call',count:18,col:'#f0fdf4'},
    {title:'Completed',count:22,col:'#f0fdf4'},
  ];
  const colW = Math.floor((cw - 40) / columns.length);
  const avBgs2 = ['#6366f1','#0891b2','#d97706'];
  const cardNames = [['James M.','Amanda T.','Chris W.'],['Rachel N.','Linda P.','Tom B.'],['Mike T.','Emma R.','David W.'],['Sarah C.','Lisa P.','Mark O.'],['Ray K.','Ana M.','Joe D.']];
  const cardInits = [['JM','AT','CW'],['RN','LP','TB'],['MT','ER','DW'],['SC','LP','MO'],['RK','AM','JD']];
  columns.forEach((col, ci) => {
    const colFrame = fr(colW - 8, 852 - 48, col.col, 12);
    colFrame.strokes = c(T.border); colFrame.strokeWeight = 1; colFrame.strokeAlign = 'INSIDE';
    place(colFrame, tx(col.title, 13, 600, T.fg), 12, 12);
    const cnt = badge(String(col.count), T.white, T.mutedFg);
    place(colFrame, cnt, colFrame.width - cnt.width - 12, 10);
    cardNames[ci].forEach((name, ki) => {
      const cardF = fr(colW - 28, 56, T.card, 8);
      cardF.strokes = c(T.border); cardF.strokeWeight = 1; cardF.strokeAlign = 'INSIDE';
      place(cardF, avatar(cardInits[ci][ki], avBgs2[ki % 3], 24), 10, 16);
      place(cardF, tx(name, 12, 500, T.fg), 42, 10);
      place(cardF, tx('Day '+(ki+1), 11, 400, T.mutedFg), 42, 26);
      place(colFrame, cardF, 10, 40 + ki * 64);
    });
    place(screen, colFrame, cx + 16 + ci * colW, cy + 48);
  });
  return screen;
}

function buildSegmentList() {
  const screen = makeScreen('Segments', 'workflow');
  const cx = 220, cy = 48, cw = 1220;
  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search segments…', 280), 16, 9);
  const newBtn = btn('+ New Segment', T.primary, T.white);
  place(toolbar, newBtn, cw - newBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);
  const cols = [
    {label:'Segment Name',w:280},{label:'Status',w:120},{label:'Enrolled',w:120},
    {label:'Filters',w:200},{label:'Last Updated',w:140},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 52);
  const segs = [
    {n:'New Leads — Q1 2025',s:'Active',e:142,f:'3 include, 1 exclude',u:'Jan 14'},
    {n:'Pre-Approval Ready',s:'Active',e:87,f:'2 include',u:'Jan 12'},
    {n:'Inactive 90+ Days',s:'Active',e:234,f:'2 include, 2 exclude',u:'Jan 10'},
    {n:'Funded — Last 30 Days',s:'Active',e:28,f:'1 include',u:'Jan 8'},
    {n:'Broker Partners',s:'Inactive',e:0,f:'1 include, 1 exclude',u:'Dec 28'},
    {n:'High-Value Prospects',s:'Active',e:56,f:'4 include',u:'Dec 20'},
  ];
  const avBgs = ['#6366f1','#0891b2','#d97706','#7c3aed','#059669','#dc2626'];
  segs.forEach((s,i) => {
    place(screen, tableRow([
      {type:'avatar',initials:s.n.slice(0,2).toUpperCase(),bg:avBgs[i],name:s.n},
      {type:'badge',label:s.s,bg:s.s==='Active'?'#f0fdf4':'#f3f4f6',fg:s.s==='Active'?'#15803d':'#6b7280'},
      s.e+' contacts', s.f, s.u,
    ], cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy+88+i*48);
  });
  return screen;
}

function buildSegmentDetail() {
  const screen = makeScreen('Segment: New Leads — Q1 2025', 'workflow');
  const cx = 220, cy = 48, cw = 1220;

  const infoBar = fr(cw, 64, T.card);
  infoBar.strokes = c(T.border); infoBar.strokeWeight = 1; infoBar.strokeAlign = 'INSIDE';
  place(infoBar, tx('New Leads — Q1 2025', 18, 600, T.fg), 24, 20);
  const ab = badge('Active','#f0fdf4','#15803d');
  place(infoBar, ab, 24 + 196, 24);
  place(infoBar, tx('142 contacts enrolled', 13, 400, T.mutedFg), cw - 260, 24);
  const editBtn = btn('Edit Segment', null, T.primary, T.primary);
  place(infoBar, editBtn, cw - editBtn.width - 24, 16);
  place(screen, infoBar, cx, cy);

  const filtersBar = fr(cw, 84, T.muted);
  filtersBar.strokes = c(T.border); filtersBar.strokeWeight = 1; filtersBar.strokeAlign = 'INSIDE';
  const incL = tx('INCLUDE', 10, 700, T.mutedFg); incL.letterSpacing = {value:1,unit:'PIXELS'};
  place(filtersBar, incL, 24, 10);
  let chipX = 24;
  for (const lbl of ['Listing Status = Active','Created ≥ Jan 1, 2025','Type = Broker OR Partner']) {
    const ch = chip(lbl,'#dcfce7','#15803d',null);
    place(filtersBar, ch, chipX, 26); chipX += ch.width + 8;
  }
  const andB = badge('AND', T.muted, T.mutedFg); place(filtersBar, andB, 24, 56);
  const excL = tx('EXCLUDE', 10, 700, T.mutedFg); excL.letterSpacing = {value:1,unit:'PIXELS'};
  place(filtersBar, excL, 68, 56);
  const excCh = chip('Opted Out = true','#fee2e2','#b91c1c',null);
  place(filtersBar, excCh, 134, 56);
  place(screen, filtersBar, cx, cy + 64);

  place(screen, tabBar([{label:'Contacts',count:142},{label:'Settings'}], 0, cw), cx, cy + 148);

  const cols = [
    {label:'',w:44},{label:'Name',w:220},{label:'Email',w:220},{label:'Listing',w:200},{label:'Status',w:120},{label:'Added',w:120},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 188);
  const cts = [
    {ii:'JM',bg:'#6366f1',n:'James Martinez',em:'j.martinez@apexrealty.com',l:'Oakwood Heights #4B',d:'Jan 14'},
    {ii:'AT',bg:'#0891b2',n:'Amanda Thompson',em:'a.thompson@blue.com',l:'Riverside Condos #12',d:'Jan 13'},
    {ii:'CW',bg:'#d97706',n:'Chris Wilson',em:'c.wilson@summit.com',l:'Summit Villas #7',d:'Jan 12'},
    {ii:'RN',bg:'#7c3aed',n:'Rachel Nakamura',em:'r.nakamura@horizon.co',l:'Harbor View #3A',d:'Jan 11'},
  ];
  cts.forEach((ct,i) => place(screen, tableRow([
    {type:'dot',color:'#e5e7eb'},
    {type:'avatar',initials:ct.ii,bg:ct.bg,name:ct.n,sub:ct.em},
    '',ct.l,{type:'badge',label:'Active',bg:'#f0fdf4',fg:'#15803d'},ct.d,
  ], cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy+224+i*48));
  return screen;
}

function buildSegmentBuilder() {
  const screen = makeScreen('Segment Builder', 'workflow');
  const cx = 220, cy = 48, cw = 1220;
  const hbar = fr(cw, 56, T.card);
  hbar.strokes = c(T.border); hbar.strokeWeight = 1; hbar.strokeAlign = 'INSIDE';
  const nameInp = fr(280, 34, T.muted, 8);
  nameInp.strokes = c(T.border); nameInp.strokeWeight = 1; nameInp.strokeAlign = 'INSIDE';
  place(nameInp, tx('Segment name…', 13, 400, T.mutedFg), 12, 9);
  place(hbar, nameInp, 16, 11);
  const prevBtn = btn('Preview Contacts', null, T.primary, T.primary);
  const saveBtn = btn('Save Segment', T.primary, T.white);
  place(hbar, prevBtn, cw - prevBtn.width - saveBtn.width - 28, 11);
  place(hbar, saveBtn, cw - saveBtn.width - 16, 11);
  place(screen, hbar, cx, cy);

  function filterSection(title, color, rules, startY) {
    const sec = fr(cw - 48, 48 + rules.length * 48 + 44, T.card, 12);
    sec.strokes = c(T.border); sec.strokeWeight = 1; sec.strokeAlign = 'INSIDE';
    const secHdr = fr(sec.width, 40, color);
    place(secHdr, tx(title, 14, 600, color === '#f0fdf4' ? '#15803d' : '#b91c1c'), 16, 11);
    sec.appendChild(secHdr);
    rules.forEach((rule, ri) => {
      const logic = ri === 0 ? 'WHERE' : 'AND';
      const lb = badge(logic, T.muted, T.mutedFg); lb.x = 16; lb.y = 48 + ri * 48 + 12;
      sec.appendChild(lb);
      const makeDrop = (text, x, w2) => {
        const d = fr(w2, 34, T.muted, 8);
        d.strokes = c(T.border); d.strokeWeight = 1; d.strokeAlign = 'INSIDE';
        place(d, tx(text + ' ▾', 12, 400, T.fg2), 10, 9);
        d.x = x; d.y = 48 + ri * 48 + 8;
        sec.appendChild(d);
      };
      makeDrop(rule[0], 72, 160); makeDrop(rule[1], 240, 110); makeDrop(rule[2], 358, 180);
    });
    const addRuleBtn = btn('+ Add Rule', null, color === '#f0fdf4' ? '#15803d' : '#b91c1c', color === '#f0fdf4' ? '#86efac' : '#fca5a5');
    place(sec, addRuleBtn, 16, 48 + rules.length * 48 + 8);
    place(screen, sec, cx + 24, startY);
  }

  filterSection('#f0fdf4', '#f0fdf4', [
    ['Listing Status','equals','Active'],
    ['Created Date','is after','Jan 1, 2025'],
    ['Contact Type','is one of','Broker, Partner'],
  ], cy + 72);

  filterSection('#fef2f2', '#fef2f2', [
    ['Opted Out','is true','—'],
  ], cy + 72 + 48 + 3*48 + 44 + 24);

  return screen;
}

function buildTemplates() {
  const screen = makeScreen('Templates', 'workflow');
  const cx = 220, cy = 48, cw = 1220;
  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search templates…', 280), 16, 9);
  const newBtn = btn('+ New Template', T.primary, T.white);
  place(toolbar, newBtn, cw - newBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);
  place(screen, tabBar([{label:'Email',count:18},{label:'SMS',count:9},{label:'Voicemail',count:4}], 0, cw), cx, cy + 52);
  const templates = [
    {n:'Welcome Email',s:'Welcome to LoanBud, {{firstName}}!',cat:'Onboarding',u:'Jan 10'},
    {n:'Pre-Approval Ready',s:'Great news! You\'re pre-approved',cat:'Nurture',u:'Jan 8'},
    {n:'Rate Alert',s:'Rates just dropped — act now!',cat:'Alert',u:'Jan 5'},
    {n:'Document Request',s:'Action required: upload your docs',cat:'Operational',u:'Dec 28'},
    {n:'Post-Closing Thanks',s:'Congratulations on your new home!',cat:'Post-Close',u:'Dec 20'},
    {n:'Monthly Market Update',s:'{{month}} mortgage market recap',cat:'Newsletter',u:'Dec 15'},
    {n:'Re-engagement',s:'We miss you, {{firstName}}',cat:'Nurture',u:'Dec 10'},
    {n:'Birthday Greeting',s:'Happy Birthday from the LoanBud team!',cat:'Relationship',u:'Dec 5'},
  ];
  const cardW = 268, cardH = 136, gap = 20;
  const cols4 = Math.floor((cw - 48) / (cardW + gap));
  templates.forEach((t, i) => {
    const col = i % cols4, row = Math.floor(i / cols4);
    const card = fr(cardW, cardH, T.card, 10);
    card.strokes = c(T.border); card.strokeWeight = 1; card.strokeAlign = 'INSIDE';
    const cb = badge(t.cat, T.muted, T.mutedFg);
    place(card, cb, 12, 12);
    place(card, tx(t.n, 14, 600, T.fg), 12, 38);
    const sub = tx(t.s, 11, 400, T.mutedFg, cardW - 24);
    place(card, sub, 12, 60);
    place(card, tx('Updated '+t.u, 10, 400, T.mutedFg), 12, 108);
    const eb = btn('Edit', null, T.primary, T.primary);
    place(card, eb, cardW - eb.width - 10, 96);
    place(screen, card, cx + 24 + col * (cardW + gap), cy + 108 + row * (cardH + gap));
  });
  return screen;
}

function buildEmailHistory() {
  const screen = makeScreen('Email History', 'workflow');
  const cx = 220, cy = 48, cw = 1220;
  const toolbar = fr(cw, 52, T.card);
  toolbar.strokes = c(T.border); toolbar.strokeWeight = 1; toolbar.strokeAlign = 'INSIDE';
  place(toolbar, searchInput('Search history…', 260), 16, 9);
  const filterBtn = btn('Date Range ▾', null, T.mutedFg, T.border);
  place(toolbar, filterBtn, 284, 9);
  const exportBtn = btn('Export CSV', null, T.mutedFg, T.border);
  place(toolbar, exportBtn, cw - exportBtn.width - 16, 9);
  place(screen, toolbar, cx, cy);
  const cols = [
    {label:'Contact',w:180},{label:'Subject',w:280},{label:'Sent Date',w:160},
    {label:'Type',w:100},{label:'Status',w:120},{label:'Opens',w:80},{label:'Clicks',w:80},
  ];
  place(screen, tableHeaderRow(cols, cw), cx, cy + 52);
  const statColors = {
    Opened:      {bg:'#eff6ff',fg:'#1d4ed8'},
    Clicked:     {bg:'#f0fdf4',fg:'#15803d'},
    Delivered:   {bg:'#f3f4f6',fg:'#6b7280'},
    Bounced:     {bg:'#fef2f2',fg:'#b91c1c'},
    Unsubscribed:{bg:'#fef9c3',fg:'#a16207'},
  };
  const emails = [
    {contact:'James Martinez',subject:'Welcome to LoanBud, James!',date:'Jan 14, 10:24am',type:'Email',status:'Opened',opens:'3',clicks:'1'},
    {contact:'Amanda Thompson',subject:'Great news! You\'re pre-approved',date:'Jan 13, 2:15pm',type:'Email',status:'Clicked',opens:'2',clicks:'3'},
    {contact:'Chris Wilson',subject:'Rates just dropped — act now!',date:'Jan 12, 9:00am',type:'Email',status:'Delivered',opens:'0',clicks:'0'},
    {contact:'Rachel Nakamura',subject:'Action required: upload your docs',date:'Jan 11, 11:30am',type:'Email',status:'Bounced',opens:'0',clicks:'0'},
    {contact:'Mark OBrien',subject:'Monthly market recap — January',date:'Jan 10, 8:00am',type:'Email',status:'Opened',opens:'1',clicks:'0'},
    {contact:'Linda Park',subject:'We miss you, Linda',date:'Jan 9, 3:00pm',type:'Email',status:'Unsubscribed',opens:'1',clicks:'0'},
  ];
  emails.forEach((em,i) => {
    const sc = statColors[em.status];
    place(screen, tableRow([
      em.contact, em.subject, em.date, em.type,
      {type:'badge',label:em.status,bg:sc.bg,fg:sc.fg},
      em.opens, em.clicks,
    ], cols, cw, i%2===1?'#fcfcfc':T.card), cx, cy+88+i*48);
  });
  return screen;
}

// ─── Components page ──────────────────────────────────────────────────────────

async function buildComponentsPage(page) {
  page.name = '🧩 Components';
  figma.currentPage = page;
  let y = 0;

  async function section(title, buildFn) {
    const lbl = tx(title, 18, 600, T.primary); place(page, lbl, 0, y); y += 32;
    await buildFn();
    y += 32;
  }

  await section('Buttons', async () => {
    const variants = [
      {label:'Primary',bg:T.primary,fg:T.white,border:null},
      {label:'Secondary',bg:'#f3f4f6',fg:T.fg,border:null},
      {label:'Outline',bg:T.card,fg:T.fg,border:T.border},
      {label:'Ghost',bg:null,fg:T.primary,border:null},
      {label:'Destructive',bg:'#dc2626',fg:T.white,border:null},
    ];
    let x = 0;
    for (const v of variants) {
      const b = btn(v.label, v.bg, v.fg, v.border);
      b.name = 'Button/'+v.label; place(page, b, x, y); x += b.width + 12;
    }
    y += 40;
  });

  await section('Badges', async () => {
    const variants = [
      {label:'Default',bg:T.primary,fg:T.white},
      {label:'Success',bg:'#dcfce7',fg:'#15803d'},
      {label:'Warning',bg:'#fef9c3',fg:'#a16207'},
      {label:'Error',bg:'#fee2e2',fg:'#b91c1c'},
      {label:'Info',bg:'#dbeafe',fg:'#1d4ed8'},
      {label:'Secondary',bg:'#f3f4f6',fg:T.fg},
    ];
    let x = 0;
    for (const v of variants) {
      const b = badge(v.label, v.bg, v.fg);
      b.name = 'Badge/'+v.label; place(page, b, x, y); x += b.width + 10;
    }
    y += 32;
  });

  await section('Application Stage Chips', async () => {
    const stages = [
      {label:'Leads',bg:T.leads.bg,fg:T.leads.fg,dot:T.leads.dot},
      {label:'Prequalification Review',bg:T.preqReview.bg,fg:T.preqReview.fg,dot:T.preqReview.dot},
      {label:'Completed Initial Application',bg:T.completed.bg,fg:T.completed.fg,dot:T.completed.dot},
      {label:'Submitted to Underwriting',bg:T.submitted.bg,fg:T.submitted.fg,dot:T.submitted.dot},
      {label:'Requested Prepaid Docs',bg:T.prepaid.bg,fg:T.prepaid.fg,dot:T.prepaid.dot},
      {label:'On Hold',bg:T.onHold.bg,fg:T.onHold.fg,dot:T.onHold.dot},
      {label:'Withdrawn',bg:T.withdrawn.bg,fg:T.withdrawn.fg,dot:T.withdrawn.dot},
      {label:'Funded',bg:T.funded.bg,fg:T.funded.fg,dot:T.funded.dot},
    ];
    let x = 0;
    for (const s of stages) {
      const ch = chip(s.label, s.bg, s.fg, s.dot);
      ch.name = 'Chip/'+s.label; place(page, ch, x, y);
      if (x + ch.width + 12 > 1400) { x = 0; y += 32; } else x += ch.width + 12;
    }
    y += 32;
  });

  await section('Filter Chips', async () => {
    const items = [
      {label:'Listing Status = Active',bg:'#dcfce7',fg:'#15803d'},
      {label:'AND',bg:T.muted,fg:T.mutedFg},
      {label:'Created >= Jan 1',bg:'#dcfce7',fg:'#15803d'},
      {label:'Opted Out = true',bg:'#fee2e2',fg:'#b91c1c'},
    ];
    let x = 0;
    for (const it of items) {
      const ch = chip(it.label, it.bg, it.fg, null);
      ch.name = 'FilterChip/'+it.label; place(page, ch, x, y); x += ch.width + 10;
    }
    y += 32;
  });

  await section('Sidebar (Expanded)', async () => {
    const sb = makeSidebar('crm'); sb.name = 'Sidebar/Expanded';
    place(page, sb, 0, y); y += 910;
  });

  await section('App Header (1440px)', async () => {
    const h = makeHeader('Page Title', 1440); h.name = 'AppHeader';
    place(page, h, 0, y); y += 60;
  });

  await section('Search Input', async () => {
    const si = searchInput('Search contacts…', 300); place(page, si, 0, y); y += 40;
  });
}

// ─── Flow page builder ────────────────────────────────────────────────────────

async function buildFlowPage(page, title, screenBuilders) {
  page.name = title;
  figma.currentPage = page;
  const SCREEN_W = 1440, SCREEN_H = 900, GAP = 240;
  const titleTx = tx(title.replace(/^\S+ /, ''), 32, 700, T.primary);
  place(page, titleTx, 0, 0);
  const allFrames = [];
  for (let i = 0; i < screenBuilders.length; i++) {
    const screenFrame = screenBuilders[i]();
    screenFrame.x = i * (SCREEN_W + GAP);
    screenFrame.y = 56;
    page.appendChild(screenFrame);
    allFrames.push(screenFrame);
    const numLbl = tx((i+1)+'. '+screenFrame.name, 16, 500, T.mutedFg);
    numLbl.x = i * (SCREEN_W + GAP); numLbl.y = 56 + SCREEN_H + 16;
    page.appendChild(numLbl);
    if (i < screenBuilders.length - 1) {
      const arrow = tx('→', 56, 400, T.border);
      arrow.x = i * (SCREEN_W + GAP) + SCREEN_W + GAP/2 - 24;
      arrow.y = 56 + SCREEN_H/2 - 32;
      page.appendChild(arrow);
    }
  }
  figma.viewport.scrollAndZoomIntoView(allFrames);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  try {
    const defaultPage = figma.root.children[0];

    figma.notify('Loading fonts…');
    await loadFonts();

    figma.notify('Building Components page…');
    const compPage = figma.createPage();
    await buildComponentsPage(compPage);

    figma.notify('Building Application Flow…');
    const appPage = figma.createPage();
    await buildFlowPage(appPage, '📋 Application Flow', [buildApplications, buildBusinessAcquisition]);

    figma.notify('Building CRM Flow…');
    const crmPage = figma.createPage();
    await buildFlowPage(crmPage, '👥 CRM Flow', [buildCRMContacts, buildContactDetail, buildTaskQueue]);

    figma.notify('Building Workflow Flow…');
    const wfPage = figma.createPage();
    await buildFlowPage(wfPage, '🔄 Workflow Flow', [buildWorkflowList, buildWorkflowBuilder, buildWorkflowBoard]);

    figma.notify('Building Segment Flow…');
    const segPage = figma.createPage();
    await buildFlowPage(segPage, '🗂️ Segment Flow', [buildSegmentList, buildSegmentBuilder, buildSegmentDetail]);

    figma.notify('Building Content Flow…');
    const contentPage = figma.createPage();
    await buildFlowPage(contentPage, '📧 Content Flow', [buildTemplates, buildEmailHistory]);

    if (defaultPage && defaultPage.children.length === 0) defaultPage.remove();

    // Land on the Components page
    figma.currentPage = compPage;
    figma.viewport.scrollAndZoomIntoView(compPage.children);

    figma.notify('✅ Done! 6 pages created — fully editable.', { timeout: 8000 });
    figma.closePlugin();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify('❌ Error: ' + msg, { error: true, timeout: 10000 });
    console.error('Plugin error:', err);
    figma.closePlugin();
  }
})();
