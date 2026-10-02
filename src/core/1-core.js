/* ============================================================
   Tiện Ích Nhanh — core: registry, search, storage, router, pages
   Mỗi tool là một module độc lập đăng ký qua TI.define({...}).
   Production: mỗi module là một chunk riêng (dynamic import);
   ở bản một-file này, render() chỉ chạy khi người dùng mở tool.
   ============================================================ */
(function () {
'use strict';
const TI = window.TI = window.TI || {};

/* ---------- Categories ---------- */
const CATS = [
  ['text', '✍️', 'Văn bản', 'blue', 'Đếm chữ, đổi kiểu chữ, làm sạch và sắp xếp văn bản'],
  ['calc', '🧮', 'Máy tính', 'violet', 'Phần trăm, trung bình, phân số và toán cơ bản'],
  ['finance', '💰', 'Tài chính', 'green', 'VAT, chiết khấu, lãi suất, lợi nhuận bán hàng'],
  ['convert', '🔄', 'Chuyển đổi', 'teal', 'Độ dài, khối lượng, nhiệt độ, dung lượng dữ liệu'],
  ['datetime', '📅', 'Ngày & giờ', 'amber', 'Tính tuổi, đếm ngày, hẹn giờ và bấm giờ'],
  ['random', '🎲', 'Random & trò chơi', 'rose', 'Số ngẫu nhiên, xúc xắc, đồng xu, chọn ngẫu nhiên'],
  ['wheel', '🎡', 'Vòng quay & bốc thăm', 'rose', 'Vòng quay may mắn và bốc thăm online'],
  ['team', '👥', 'Chia nhóm', 'rose', 'Chia đội, chia nhóm và ghép cặp ngẫu nhiên'],
  ['image', '🖼️', 'Hình ảnh', 'violet', 'Nén, resize, đổi định dạng ảnh ngay trên máy'],
  ['pdf', '📄', 'PDF & tài liệu', 'slate', 'Gộp, tách, nén và chuyển đổi PDF'],
  ['qr', '🔗', 'QR & Barcode', 'slate', 'Tạo mã QR cho link, WiFi, danh thiếp'],
  ['internet', '🌐', 'Internet', 'teal', 'URL, UTM, kiểm tra website và mạng'],
  ['dev', '👨‍💻', 'Developer', 'slate', 'JSON, Base64, UUID, hash và mã hóa'],
  ['design', '🎨', 'Thiết kế', 'violet', 'Màu sắc, gradient, độ tương phản'],
  ['marketing', '📣', 'Marketing', 'amber', 'ROAS, ACOS, CTR, CPC và công cụ SEO'],
  ['social', '📱', 'Social Media', 'rose', 'Caption, hashtag, đếm ký tự mạng xã hội'],
  ['study', '🎓', 'Học tập', 'blue', 'Điểm trung bình, GPA, flashcard, trích dẫn'],
  ['security', '🔐', 'Bảo mật', 'slate', 'Tạo mật khẩu mạnh, hash, khóa bí mật'],
  ['life', '🏠', 'Đời sống', 'green', 'Chia tiền, chọn món, checklist, kế hoạch'],
  ['vehicle', '🚗', 'Xe cộ', 'teal', 'Chi phí xăng, tiêu hao nhiên liệu, quãng đường'],
  ['travel', '✈️', 'Du lịch', 'teal', 'Múi giờ, chia tiền chuyến đi, checklist hành lý'],
  ['vn', '🇻🇳', 'Tiện ích Việt Nam', 'rose', 'Lương Gross–Net, thuế TNCN, tiền điện, âm lịch'],
  ['fitness', '🏃', 'Thể chất', 'green', 'BMI, BMR, TDEE, pace chạy bộ'],
  ['file', '📁', 'File & dữ liệu', 'slate', 'CSV, JSON, gộp và tách file văn bản'],
  ['av', '🎵', 'Audio & Video', 'violet', 'Cắt, nén, chuyển đổi âm thanh và video']
].map(([id, icon, name, acc, desc]) => ({ id, icon, name, acc, desc }));
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
TI.CATS = CATS; TI.CAT = CAT;

/* ---------- Registry ---------- */
const LIVE = [];          // tools có giao diện chạy được
const BY_SLUG = {};
TI.define = function (t) {
  t.live = true; t.level = t.level || 1; t.pop = t.pop || 0; t.related = t.related || [];
  t.aliases = t.aliases || []; t.faq = t.faq || []; t.kw = t.kw || '';
  LIVE.push(t); BY_SLUG[t.slug] = t;
};
let ALL = [];             // live + catalog (sắp ra mắt)
const ALIAS = {};         // slug cũ / tiếng Anh → slug chính
function buildIndex() {
  const taken = new Set();
  LIVE.forEach(t => { taken.add(t.slug); t.aliases.forEach(a => { taken.add(a); ALIAS[a] = t.slug; }); });
  const soon = (TI.CATALOG || []).filter(r => !taken.has(r[0])).map((r, i) => ({
    slug: r[0], name: r[1], cat: r[2], desc: r[3], audience: r[4], level: r[5], pri: r[6], live: false,
    icon: CAT[r[2]].icon, kw: '', pop: 0, order: i
  }));
  soon.forEach(t => { BY_SLUG[t.slug] = t; });
  ALL = LIVE.concat(soon);
  ALL.forEach(t => {
    const c = CAT[t.cat];
    t._n = norm(t.name); t._k = norm(t.kw + ' ' + t.desc); t._c = norm(c.name);
    t._words = t._n.split(' ');
  });
  TI.ALL = ALL; TI.LIVE = LIVE;
}
TI.get = s => BY_SLUG[s];

/* ---------- Text helpers ---------- */
function norm(s) {
  return String(s || '').toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%]+/g, ' ').trim();
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
TI.norm = norm; TI.esc = esc;
const NF = {};
function fmt(n, d = 2) {
  if (n == null || !isFinite(n)) return '—';
  const k = d; NF[k] = NF[k] || new Intl.NumberFormat('vi-VN', { maximumFractionDigits: d });
  return NF[k].format(Math.abs(n) < 1e-12 ? 0 : n);
}
function parseNum(v) {
  if (typeof v === 'number') return v;
  let s = String(v || '').trim().replace(/\s|₫|đ|%|\$/gi, '');
  if (!s) return NaN;
  const hasDot = s.includes('.'), hasCom = s.includes(',');
  if (hasDot && hasCom) { s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, ''); }
  else if (hasCom) { s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.'); }
  else if (hasDot && /^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s); return isFinite(n) ? n : NaN;
}
TI.fmt = fmt; TI.parseNum = parseNum;
TI.money = n => isFinite(n) ? fmt(Math.round(n), 0) + ' ₫' : '—';

/* ---------- Storage (an toàn khi bị chặn) ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('ti_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ti_' + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
};
TI.store = store;
let favs = store.get('favs', []);
let recent = store.get('recent', []);
const isFav = s => favs.includes(s);
function toggleFav(s) {
  favs = isFav(s) ? favs.filter(x => x !== s) : [s].concat(favs);
  store.set('favs', favs); track('favorite', s);
  document.querySelectorAll('[data-fav="' + s + '"]').forEach(b => setFavBtn(b, s));
  toast(isFav(s) ? 'Đã thêm vào Yêu thích' : 'Đã bỏ khỏi Yêu thích');
}
function setFavBtn(b, s) { const on = isFav(s); b.setAttribute('aria-pressed', on); b.innerHTML = on ? '♥' : '♡'; b.setAttribute('aria-label', on ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'); }
function pushRecent(s) { recent = [s].concat(recent.filter(x => x !== s)).slice(0, 8); store.set('recent', recent); }

/* ---------- Analytics (cục bộ; production gửi về endpoint /api/events) ---------- */
function track(type, slug, extra) {
  const st = store.get('stats', { tools: {}, search: {}, cats: {} });
  if (slug) { const t = st.tools[slug] = st.tools[slug] || {}; t[type] = (t[type] || 0) + 1; }
  if (type === 'search' && extra) st.search[extra] = (st.search[extra] || 0) + 1;
  if (type === 'cat' && extra) st.cats[extra] = (st.cats[extra] || 0) + 1;
  store.set('stats', st);
}
TI.track = track;

/* ---------- UI primitives ---------- */
const ICON = {
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9.3-9.2C1.6 7.6 3.6 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.6 0 5.6 3.6 4.5 6.8C19.5 15.4 12 20 12 20z"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  link: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'
};
TI.ICON = ICON;
const LOGO = '<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><rect class="m2" x="2" y="2" width="13" height="13" rx="4"/><rect class="m1" x="17" y="2" width="13" height="13" rx="6.5"/><rect class="m1" x="2" y="17" width="13" height="13" rx="6.5"/><rect class="m2" x="17" y="17" width="13" height="13" rx="4"/></svg>';

let toastWrap;
function toast(msg) {
  if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; toastWrap.setAttribute('role', 'status'); document.body.appendChild(toastWrap); }
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; toastWrap.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
TI.toast = toast;
async function copy(text, slug) {
  text = String(text);
  try { await navigator.clipboard.writeText(text); toast('Đã sao chép'); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
    ta.remove(); toast(ok ? 'Đã sao chép' : 'Không sao chép được, hãy chọn và sao chép thủ công');
  }
  track('copy', slug || currentSlug);
}
TI.copy = copy;
const dlCap = (window.claude && window.claude.use) ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
async function download(filename, data, mime) {
  track('download', currentSlug);
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain;charset=utf-8' });
  const cap = await Promise.race([dlCap, new Promise(r => setTimeout(() => r(null), 600))]);
  if (cap) {
    try { await cap.save({ filename, data: blob }); return; }
    catch (e) { if (e && (e.code === 'declined' || e.code === 'rate_limited')) return; if (e && e.code === 'rejected_extension') { toast('Định dạng này chưa tải được ở đây'); return; } }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
TI.download = download;

/* ---------- Search ---------- */
function search(q, limit = 8, opts = {}) {
  const nq = norm(q); if (!nq) return [];
  const toks = nq.split(' ').filter(Boolean);
  const out = [];
  for (const t of ALL) {
    if (opts.liveOnly && !t.live) continue;
    let s = 0;
    if (t._n === nq) s += 200; else if (t._n.startsWith(nq)) s += 120; else if (t._n.includes(nq)) s += 70;
    if (t._k.includes(nq)) s += 40;
    let all = true;
    for (const w of toks) {
      let ws = 0;
      if (t._words.some(x => x.startsWith(w))) ws = 22; else if (t._n.includes(w)) ws = 12;
      if ((' ' + t._k).includes(' ' + w)) ws = Math.max(ws, 14); else if (w.length > 2 && t._k.includes(w)) ws = Math.max(ws, 7);
      if (t._c.includes(w)) ws = Math.max(ws, 5);
      if (!ws) { all = false; break; }
      s += ws;
    }
    if (!all) continue;
    if (t.live) s += 70 + t.pop / 10; else s *= 0.6;
    out.push([s, t]);
  }
  out.sort((a, b) => b[0] - a[0]);
  return out.slice(0, limit).map(x => x[1]);
}
TI.search = search;
function hl(name, q) {
  const nq = norm(q); if (!nq) return esc(name);
  const toks = nq.split(' ').filter(w => w.length > 0);
  // highlight theo vị trí trong chuỗi đã chuẩn hóa (giữ độ dài ký tự gốc)
  const base = name.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (base.length !== name.length) return esc(name);
  const mark = new Array(name.length).fill(false);
  toks.forEach(w => { let i = base.indexOf(w); if (i >= 0) for (let j = i; j < i + w.length; j++) mark[j] = true; });
  let html = '', open = false;
  for (let i = 0; i < name.length; i++) { if (mark[i] && !open) { html += '<mark>'; open = true; } if (!mark[i] && open) { html += '</mark>'; open = false; } html += esc(name[i]); }
  return html + (open ? '</mark>' : '');
}

/* Search widget: autocomplete + bàn phím */
function mountSearch(root, { size = '', placeholder = 'Tìm kiếm công cụ…', autofocus = false, inline = false } = {}) {
  const id = 's' + Math.random().toString(36).slice(2, 7);
  root.innerHTML = '<div class="search ' + size + '" role="combobox" aria-haspopup="listbox" aria-owns="' + id + '-l" aria-expanded="false">' +
    '<label class="search-box">' + '<span class="search-ico">' + ICON.search + '</span><span class="sr-only">Tìm công cụ</span>' +
    '<input id="' + id + '" type="search" autocomplete="off" spellcheck="false" placeholder="' + esc(placeholder) + '" aria-autocomplete="list" aria-controls="' + id + '-l">' +
    (size ? '' : '<span class="kbd" aria-hidden="true">/</span>') + '</label>' +
    '<div class="dropdown" id="' + id + '-l" role="listbox" hidden></div></div>';
  const wrap = root.firstChild, input = root.querySelector('input'), dd = root.querySelector('.dropdown');
  let items = [], sel = -1, timer;
  function render() {
    const q = input.value.trim();
    if (!q) {
      if (inline) { dd.hidden = false; dd.innerHTML = '<div class="dd-head t-caption">Gợi ý</div>' + popular(6).map(itemHtml).join(''); items = popular(6); sel = -1; bindItems(); return; }
      close(); return;
    }
    items = search(q, inline ? 20 : 8);
    dd.hidden = false; wrap.setAttribute('aria-expanded', 'true'); sel = items.length ? 0 : -1;
    if (!items.length) { dd.innerHTML = '<div class="dd-empty">Chưa có công cụ cho “' + esc(q) + '”. Thử từ khóa khác như “phần trăm”, “random”, “ảnh”.</div>'; return; }
    dd.innerHTML = items.map((t, i) => itemHtml(t, i, q)).join('') +
      '<a class="dd-item" href="#tools" data-all="1"><span class="icon-tile sm acc-slate">' + ICON.search + '</span><span class="dd-item-name">Xem tất cả kết quả cho “' + esc(q) + '”</span></a>';
    bindItems(); paintSel();
  }
  function itemHtml(t, i, q) {
    const c = CAT[t.cat];
    return '<a class="dd-item" role="option" href="#' + t.slug + '" data-i="' + i + '"><span class="icon-tile sm acc-' + c.acc + '">' + t.icon + '</span>' +
      '<span style="min-width:0;flex:1"><span class="dd-item-name">' + hl(t.name, q || '') + '</span><br><span class="dd-item-meta">' + esc(c.name) + (t.live ? '' : ' · Sắp ra mắt') + '</span></span></a>';
  }
  function bindItems() {
    dd.querySelectorAll('.dd-item').forEach(a => a.addEventListener('click', () => {
      const q = input.value.trim(); if (q) track('search', null, norm(q));
      if (a.dataset.all) { dirState.q = q; }
      input.value = ''; close(); if (root.closest('.search-sheet')) closeOverlays();
    }));
  }
  function paintSel() { dd.querySelectorAll('[data-i]').forEach(a => a.setAttribute('aria-selected', +a.dataset.i === sel)); }
  function close() { if (!inline) { dd.hidden = true; wrap.setAttribute('aria-expanded', 'false'); } }
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 60); });
  input.addEventListener('focus', render);
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); paintSel(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); paintSel(); }
    else if (e.key === 'Enter') {
      e.preventDefault(); const q = input.value.trim();
      if (q) track('search', null, norm(q));
      if (items[sel]) { go(items[sel].slug); } else if (q) { dirState.q = q; go('tools'); }
      input.value = ''; close(); input.blur(); closeOverlays();
    } else if (e.key === 'Escape') { input.value = ''; close(); input.blur(); }
  });
  document.addEventListener('click', e => { if (!root.contains(e.target)) close(); });
  if (autofocus) setTimeout(() => input.focus(), 30);
  if (inline) render();
  return input;
}
TI.mountSearch = mountSearch;

/* ---------- Cards ---------- */
function popular(n) { return LIVE.slice().sort((a, b) => b.pop - a.pop).slice(0, n); }
function toolCard(t, opts = {}) {
  const c = CAT[t.cat];
  const badge = !t.live ? '<span class="badge badge-soon">Sắp ra mắt</span>' : t.isNew ? '<span class="badge badge-new">Mới</span>' : t.pop >= 90 ? '<span class="badge badge-hot">Phổ biến</span>' : '';
  if (opts.compact) return '<a class="tool-card compact' + (t.live ? '' : ' is-soon') + '" href="#' + t.slug + '"><span class="icon-tile sm acc-' + c.acc + '">' + t.icon + '</span><span style="min-width:0"><span class="tool-card-name">' + esc(t.name) + '</span><span class="tool-card-desc">' + esc(t.desc) + '</span></span></a>';
  return '<a class="tool-card' + (t.live ? '' : ' is-soon') + '" href="#' + t.slug + '">' +
    '<div class="tool-card-head"><span class="icon-tile acc-' + c.acc + '">' + t.icon + '</span>' +
    '<button class="fav-btn" type="button" data-fav="' + t.slug + '"></button></div>' +
    '<div><div class="tool-card-name">' + esc(t.name) + '</div></div><div class="tool-card-desc">' + esc(t.desc) + '</div>' +
    '<div class="tool-card-foot"><span class="tool-card-cta">' + (t.live ? 'Sử dụng →' : 'Xem trước →') + '</span>' + badge + '</div></a>';
}
function catCard(c) {
  const n = ALL.filter(t => t.cat === c.id).length;
  return '<a class="cat-card" href="#dm-' + c.id + '"><span class="icon-tile acc-' + c.acc + '">' + c.icon + '</span><span class="cat-card-body">' +
    '<span class="cat-card-name">' + esc(c.name) + ' <span class="cat-card-count">' + n + ' công cụ</span></span><span class="cat-card-desc">' + esc(c.desc) + '</span></span></a>';
}
function hydrate(root) {
  root.querySelectorAll('[data-fav]').forEach(b => {
    const s = b.dataset.fav; setFavBtn(b, s);
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleFav(s); });
  });
}
TI.toolCard = toolCard;

/* ---------- Meta / SEO ---------- */
function setMeta({ title, desc, canonical, ld }) {
  document.title = title;
  let m = document.querySelector('meta[name="description"]');
  if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
  m.content = desc || '';
  let l = document.getElementById('ld'); if (!l) { l = document.createElement('script'); l.type = 'application/ld+json'; l.id = 'ld'; document.head.appendChild(l); }
  l.textContent = ld ? JSON.stringify(ld) : '';
  TI.canonical = canonical;
}
const SITE = (TI.SITE_URL || 'https://tienichnhanh.vn').replace(/\/$/, '');

/* ---------- Router (hash token: #slug — production: /tools/slug) ---------- */
const app = () => document.getElementById('app');
let currentSlug = null, cleanups = [];
/* PATH mode (website thật): /tools/<slug>, /danh-muc/<cat>…  HASH mode (bản xem trước một file): #<slug> */
const PATH = !!TI.PATH_MODE;
const BASE = (TI.BASE_PATH || '').replace(/\/$/, '');   // ví dụ '/tien-ich-nhanh' khi chạy trên GitHub Pages
function tokToPath(t) {
  let p;
  if (!t || t === 'home') p = '/';
  else if (t.startsWith('dm-')) p = '/danh-muc/' + t.slice(3);
  else if (['tools', 'pho-bien', 'moi', 'favorites', 'admin', 'ung-ho'].includes(t) || INFO[t]) p = '/' + t;
  else p = '/tools/' + t;
  return BASE + p;
}
function pathToTok(p) {
  p = decodeURIComponent(p);
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
  if (p === '/') return '';
  let m = p.match(/^\/danh-muc\/([\w-]+)$/); if (m) return 'dm-' + m[1];
  m = p.match(/^\/tools\/([\w-]+)$/); if (m) return m[1];
  return p.slice(1);
}
TI.tokToPath = tokToPath;
function currentTok() { return PATH ? pathToTok(location.pathname) : (decodeURIComponent(location.hash.slice(1)) || ''); }
function go(token) {
  if (PATH) { const p = tokToPath(token); if (location.pathname !== p) history.pushState(null, '', p); route(); return; }
  if (location.hash.slice(1) === token) route(); else location.hash = token;
}
TI.go = go;
function fixLinks(root) {
  if (!PATH) return;
  root.querySelectorAll('a[href^="#"]').forEach(a => { a.setAttribute('href', tokToPath(a.getAttribute('href').slice(1))); a.dataset.spa = '1'; });
}
TI.fixLinks = fixLinks;
function route() {
  cleanups.forEach(f => { try { f(); } catch (e) {} }); cleanups = [];
  currentSlug = null;
  const tok = currentTok();
  const main = app();
  if (tok === '' || tok === 'home') pageHome(main);
  else if (tok === 'tools') pageDir(main, {});
  else if (tok === 'pho-bien') pageDir(main, { sort: 'pop', title: 'Công cụ phổ biến' });
  else if (tok === 'moi') pageDir(main, { sort: 'new', title: 'Công cụ mới' });
  else if (tok.startsWith('dm-') && CAT[tok.slice(3)]) pageDir(main, { cat: tok.slice(3) });
  else if (tok === 'favorites') pageFav(main);
  else if (tok === 'admin') pageAdmin(main);
  else if (tok === 'ung-ho') pageDonate(main);
  else if (INFO[tok]) pageInfo(main, tok);
  else if (BY_SLUG[tok]) pageTool(main, BY_SLUG[tok]);
  else if (ALIAS[tok]) { if (PATH) history.replaceState(null, '', tokToPath(ALIAS[tok])); else history.replaceState(null, '', '#' + ALIAS[tok]); return route(); }
  else page404(main);
  hydrate(main); fillAds(main); fixLinks(document.body);
  document.querySelectorAll('[data-nav]').forEach(a => a.setAttribute('aria-current', a.dataset.nav === navKey(tok) ? 'page' : 'false'));
  window.scrollTo(0, 0);
}
function navKey(tok) {
  if (!tok || tok === 'home') return 'home';
  if (tok === 'tools' || tok.startsWith('dm-')) return 'tools';
  if (tok === 'pho-bien') return 'pop'; if (tok === 'moi') return 'new'; if (tok === 'favorites') return 'fav';
  return '';
}

/* ---------- Pages ---------- */
function section(title, inner, link) {
  return '<section><div class="section-head"><h2 class="t-h2">' + title + '</h2>' + (link ? link : '') + '</div>' + inner + '</section>';
}
/* Quảng cáo / affiliate: nội dung đọc từ file ads.json (sửa file đó, không cần build lại).
   Vị trí: home (giữa trang chủ) · tool (dưới công cụ) · sidebar (cột phải trang công cụ) · list (cuối danh sách) */
let ADS = null;
const ad = (slot, label) => '<div class="ad-wrap" data-ad-slot="' + slot + '" data-label="' + esc(label) + '"></div>';
function adUrl(u) { return /^(https?:)?\/\//.test(u) || u.startsWith('data:') ? u : (TI.BASE_PATH || '').replace(/\/$/, '') + '/' + u.replace(/^\//, ''); }
function fillAds(root) {
  root.querySelectorAll('[data-ad-slot]').forEach(el => {
    const slot = el.dataset.adSlot, items = ((ADS && ADS.slots && ADS.slots[slot]) || []).filter(it => it && it.url && (it.title || it.image));
    if (items.length) {
      const it = items[Math.floor(Math.random() * items.length)];
      if (it.type === 'banner' || !it.title) { el.innerHTML = '<a class="ad-banner" href="' + esc(it.url) + '" target="_blank" rel="sponsored nofollow noopener" data-ad="' + esc(slot) + '"><img src="' + esc(adUrl(it.image)) + '" alt="' + esc(it.alt || 'Quảng cáo') + '" loading="lazy"></a>'; return; }
      el.innerHTML = '<a class="ad-card" href="' + esc(it.url) + '" target="_blank" rel="sponsored nofollow noopener" data-ad="' + esc(slot) + '">' +
        (it.image ? '<img src="' + esc(adUrl(it.image)) + '" alt="" loading="lazy" width="88" height="88">' : '') +
        '<span class="ad-body"><span class="ad-tag">' + esc(ADS.label || 'Tài trợ') + '</span><span class="ad-title">' + esc(it.title) + '</span>' +
        (it.desc ? '<span class="ad-desc">' + esc(it.desc) + '</span>' : '') + (it.price ? '<span class="ad-price">' + esc(it.price) + '</span>' : '') + '</span>' +
        '<span class="btn btn-sm btn-primary ad-btn">' + esc(it.button || 'Xem ngay') + '</span></a>';
    } else if (ADS && ADS.showPlaceholders === false) el.innerHTML = '';
    else el.innerHTML = '<div class="ad-slot" aria-label="Vị trí quảng cáo">Quảng cáo · ' + esc(el.dataset.label) + '</div>';
  });
  const dn = ADS && ADS.donate && ADS.donate.account ? ADS.donate : null;
  root.querySelectorAll('[data-donate]').forEach(el => {
    if (!dn) { el.innerHTML = ''; return; }
    const kind = el.dataset.donate;
    if (kind === 'line') el.innerHTML = '<a class="donate-line" href="#ung-ho"><span aria-hidden="true">☕</span><span>' + esc(dn.short || 'Thấy công cụ hữu ích? Ủng hộ tác giả một ly cà phê') + '</span><b>Ủng hộ →</b></a>';
    else el.innerHTML = donateCard(dn, kind === 'full');
    fixLinks(el);
  });
}
/* ----- Ủng hộ: thông tin chuyển khoản + mã VietQR (chuẩn NAPAS/EMVCo, tạo ngay trên trình duyệt) ----- */
function tlv(id, v) { return id + String(v.length).padStart(2, '0') + v; }
function crc16(str) { let c = 0xFFFF; for (const b of new TextEncoder().encode(str)) { c ^= b << 8; for (let i = 0; i < 8; i++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; } return c.toString(16).toUpperCase().padStart(4, '0'); }
function vietQR({ bin, account, amount, note }) {
  const acc = tlv('00', 'A000000727') + tlv('01', tlv('00', bin) + tlv('01', account)) + tlv('02', 'QRIBFTTA');
  const add = note ? tlv('62', tlv('08', note.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').slice(0, 50))) : '';
  let p = tlv('00', '01') + tlv('01', amount ? '12' : '11') + tlv('38', acc) + tlv('53', '704') + (amount ? tlv('54', String(Math.round(amount))) : '') + tlv('58', 'VN') + add + '6304';
  return p + crc16(p);
}
TI.vietQR = vietQR;
function qrSvg(text) {
  const q = TI.qr(text, 'M'), n = q.size + 8; let d = '';
  q.modules.forEach((row, y) => row.forEach((on, x) => { if (on) d += 'M' + (x + 4) + ' ' + (y + 4) + 'h1v1h-1z'; }));
  return '<svg viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" role="img" aria-label="Mã QR chuyển khoản"><rect width="100%" height="100%" fill="#ffffff"/><path d="' + d + '" fill="#111827"/></svg>';
}
function donateCard(dn, full) {
  const qr = (() => { try { return qrSvg(vietQR({ bin: dn.bankBin, account: dn.account, note: dn.note })); } catch (e) { return ''; } })();
  const row = (k, v, c) => '<div class="donate-row"><span>' + k + '</span><b' + (c ? ' class="mono"' : '') + '>' + esc(v) + '</b>' + (c ? '<button class="btn btn-sm btn-soft" type="button" data-copy-text="' + esc(v) + '">Sao chép</button>' : '') + '</div>';
  return '<div class="donate' + (full ? ' donate-full' : '') + '">' + (full ? '' : '<h2 class="t-h3">☕ Ủng hộ dự án</h2>') +
    '<p class="donate-msg">' + esc(dn.message || 'Nếu thấy công cụ hữu ích, bạn có thể chuyển khoản ủng hộ. Đóng góp nhỏ của bạn là động lực để tôi tiếp tục phát triển dự án.') + '</p>' +
    (qr ? '<div class="donate-qr">' + qr + '<span class="hint">Mở app ngân hàng, chọn Quét QR</span></div>' : '') +
    '<div class="donate-info">' + row('Ngân hàng', dn.bankName || '') + row('Số tài khoản', dn.account, true) + row('Chủ tài khoản', dn.holder || '') + (dn.note ? row('Nội dung', dn.note, true) : '') + '</div>' +
    (full ? '' : '<a class="t-small" href="#ung-ho">Xem trang ủng hộ →</a>') + '</div>';
}
function pageDonate(main) {
  setMeta({ title: 'Ủng hộ dự án – Tiện Ích Nhanh', desc: 'Ủng hộ để Tiện Ích Nhanh tiếp tục miễn phí và có thêm công cụ mới.', canonical: SITE + '/ung-ho' });
  main.innerHTML = '<div class="wrap stack" style="max-width:760px"><ol class="crumbs"><li><a href="#">Trang chủ</a></li><li aria-current="page">Ủng hộ dự án</li></ol>' +
    '<h1 class="t-h1">Ủng hộ Tiện Ích Nhanh</h1><div class="card card-pad" data-donate="full"><p class="muted">Đang tải thông tin…</p></div>' +
    '<div class="prose"><p>Mọi công cụ trên website đều miễn phí và không cần đăng nhập. Tiền ủng hộ được dùng cho tên miền, thời gian phát triển công cụ mới và cải thiện công cụ hiện có.</p><p>Bạn cũng có thể ủng hộ bằng cách chia sẻ website cho bạn bè, hoặc gửi góp ý công cụ bạn muốn có.</p></div></div>';
}
function loadAds() {
  document.addEventListener('click', e => { const b = e.target.closest('[data-copy-text]'); if (b) copy(b.dataset.copyText); });
  if (!PATH || !window.fetch) return;
  fetch((TI.BASE_PATH || '').replace(/\/$/, '') + '/ads.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { ADS = j; fillAds(document); }).catch(() => {});
  document.addEventListener('click', e => { const a = e.target.closest('[data-ad]'); if (!a) return; track('ad_click', currentSlug, a.dataset.ad); if (window.gtag) window.gtag('event', 'ad_click', { slot: a.dataset.ad, link_url: a.href }); });
}

const QUICK = ['dem-ky-tu', 'doi-chu-hoa-thuong', 'tinh-phan-tram', 'tinh-tuoi', 'quay-random', 'tung-xuc-xac', 'tao-qr-code', 'resize-anh', 'tao-mat-khau', 'tinh-vat', 'kiem-tra-toc-do-go-phim', 'json-formatter'];
const COLLECTIONS = [
  ['🎒', 'Cho học sinh, sinh viên', ['dem-tu', 'tinh-phan-tram', 'kiem-tra-toc-do-go-phim', 'pomodoro', 'chuyen-doi-don-vi', 'diem-he-10-he-4', 'gpa-calculator']],
  ['💼', 'Cho dân văn phòng', ['dem-ky-tu', 'xoa-khoang-trang', 'chia-doi', 'tinh-luong-gross-net', 'dem-nguoc', 'tao-qr-code', 'nen-anh']],
  ['🛒', 'Cho người bán hàng', ['tinh-loi-nhuan', 'tinh-roas', 'tinh-acos', 'tinh-chiet-khau', 'tinh-vat', 'usd-sang-vnd', 'tinh-phi-san']]
];
function pageHome(main) {
  const live = LIVE.length, total = ALL.length;
  setMeta({ title: 'Tiện Ích Nhanh – Hàng trăm công cụ online miễn phí', desc: 'Hàng trăm tiện ích miễn phí cho công việc, học tập, kinh doanh và cuộc sống: đếm ký tự, tính phần trăm, quay random, tạo QR, nén ảnh…', canonical: SITE + '/',
    ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Tiện Ích Nhanh', url: SITE + '/', potentialAction: { '@type': 'SearchAction', target: SITE + '/tools?q={q}', 'query-input': 'required name=q' } } });
  const rec = recent.map(s => BY_SLUG[s]).filter(Boolean);
  const newest = LIVE.filter(t => t.isNew).slice(-8).reverse();
  main.innerHTML = '<div class="wrap stack-lg">' +
    '<section class="hero"><h1 class="t-display">Mọi công cụ bạn cần,<br>ngay trên một website.</h1>' +
    '<p class="sub">Hàng trăm tiện ích miễn phí cho công việc, học tập, kinh doanh và cuộc sống hàng ngày.</p>' +
    '<div id="hero-search" style="width:100%;display:flex;justify-content:center"></div>' +
    '<div class="hero-tags"><span>Thử:</span>' + ['tinh tuoi', 'quay so', 'uppercase', 'nén ảnh', 'mật khẩu'].map(k => '<button class="chip" type="button" data-q="' + esc(k) + '">' + esc(k) + '</button>').join('') + '</div>' +
    '<div class="hero-meta"><span><b>' + live + '</b> công cụ dùng ngay</span><span><b>' + total + '</b> công cụ trong kho</span><span><b>' + CATS.length + '</b> danh mục</span><span>Không cần đăng nhập</span></div></section>' +
    (rec.length ? section('Bạn vừa sử dụng', '<div class="tool-grid">' + rec.slice(0, 4).map(t => toolCard(t, { compact: true })).join('') + '</div>') : '') +
    section('Công cụ được sử dụng nhiều', '<div class="tool-grid">' + QUICK.map(s => BY_SLUG[s]).filter(Boolean).map(t => toolCard(t)).join('') + '</div>', '<a href="#pho-bien">Xem tất cả →</a>') +
    ad('home', 'Banner giữa trang') +
    section('Khám phá công cụ', '<div class="cat-grid">' + CATS.map(catCard).join('') + '</div>', '<a href="#tools">Tất cả công cụ →</a>') +
    section('Công cụ mới', '<div class="tool-grid">' + newest.map(t => toolCard(t)).join('') + '</div>', '<a href="#moi">Xem thêm →</a>') +
    '<section class="stack"><h2 class="t-h2">Website tiện ích online miễn phí</h2><div class="prose">' +
    '<p>Tiện Ích Nhanh gom những việc nhỏ hằng ngày vào một chỗ: đếm chữ cho bài viết, tính VAT cho hóa đơn, quay số chọn người trình bày, nén ảnh trước khi gửi Zalo. Gõ điều bạn cần vào ô tìm kiếm, chọn công cụ và xong việc trong vài giây.</p>' +
    '<p>Phần lớn công cụ chạy ngay trên trình duyệt của bạn. Văn bản, mật khẩu, ảnh và file bạn nhập không được gửi lên máy chủ.</p></div>' +
    '<div class="collections">' + COLLECTIONS.map(([e, t, list]) => '<div class="card collection"><h3 class="t-h3"><span>' + e + '</span>' + t + '</h3><ul class="link-list">' +
      list.map(s => BY_SLUG[s]).filter(Boolean).map(x => '<li><a href="#' + x.slug + '"><span>' + x.icon + '</span>' + esc(x.name) + (x.live ? '' : ' <span class="badge badge-soon">Sắp có</span>') + '</a></li>').join('') + '</ul></div>').join('') + '</div></section>' +
    '</div>';
  mountSearch(main.querySelector('#hero-search'), { size: 'search-lg', placeholder: 'Tìm kiếm: tính phần trăm, đổi chữ hoa, quay random…' });
  main.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
    const inp = main.querySelector('#hero-search input'); inp.value = b.dataset.q; inp.focus(); inp.dispatchEvent(new Event('input'));
  }));
}

const dirState = { q: '', sort: 'pop', level: '0', status: 'all', page: 1 };
function pageDir(main, opt) {
  const cat = opt.cat ? CAT[opt.cat] : null;
  if (opt.sort) dirState.sort = opt.sort;
  if (cat) track('cat', null, cat.id);
  const title = cat ? cat.name : (opt.title || 'Tất cả công cụ');
  const desc = cat ? cat.desc + '. Miễn phí, không cần cài đặt.' : 'Danh sách đầy đủ ' + ALL.length + ' công cụ online miễn phí, lọc theo danh mục, độ phổ biến và độ khó.';
  setMeta({ title: (cat ? 'Công cụ ' + cat.name + ' online miễn phí' : title) + ' – Tiện Ích Nhanh', desc, canonical: SITE + (cat ? '/danh-muc/' + cat.id : '/tools'),
    ld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: SITE + (cat ? '/danh-muc/' + cat.id : '/tools') } });
  const counts = {}; ALL.forEach(t => counts[t.cat] = (counts[t.cat] || 0) + 1);
  main.innerHTML = '<div class="wrap stack">' +
    '<ol class="crumbs"><li><a href="#">Trang chủ</a></li><li>' + (cat ? '<a href="#tools">Công cụ</a></li><li aria-current="page">' + esc(cat.name) : '<span aria-current="page">Công cụ</span>') + '</li></ol>' +
    '<div class="dir"><aside class="side" aria-label="Danh mục"><ul class="side-list"><li><a href="#tools" aria-current="' + !cat + '"><span class="e">🗂️</span>Tất cả<span class="n">' + ALL.length + '</span></a></li>' +
    CATS.map(c => '<li><a href="#dm-' + c.id + '" aria-current="' + (cat && cat.id === c.id) + '"><span class="e">' + c.icon + '</span>' + esc(c.name) + '<span class="n">' + (counts[c.id] || 0) + '</span></a></li>').join('') + '</ul></aside>' +
    '<div class="stack" style="min-width:0">' +
    '<div class="tool-head">' + (cat ? '<span class="icon-tile lg acc-' + cat.acc + '">' + cat.icon + '</span>' : '') + '<div class="grow"><h1 class="t-h1">' + esc(title) + '</h1><p>' + esc(desc) + '</p></div></div>' +
    '<div class="m-cats"><a class="chip" href="#tools" aria-pressed="' + !cat + '">Tất cả</a>' + CATS.map(c => '<a class="chip" href="#dm-' + c.id + '" aria-pressed="' + (cat && cat.id === c.id) + '">' + c.icon + ' ' + esc(c.name) + '</a>').join('') + '</div>' +
    '<div class="filters"><label class="search-box" style="flex:1;min-width:200px"><span class="search-ico">' + ICON.search + '</span><input id="dir-q" type="search" placeholder="Lọc trong ' + (cat ? esc(cat.name.toLowerCase()) : 'tất cả công cụ') + '…" value="' + esc(dirState.q) + '"></label>' +
    '<select class="select" id="dir-sort" aria-label="Sắp xếp"><option value="pop">Phổ biến nhất</option><option value="new">Mới nhất</option><option value="az">Tên A → Z</option></select>' +
    '<select class="select" id="dir-level" aria-label="Độ khó"><option value="0">Mọi độ khó</option><option value="1">Dễ dùng</option><option value="2">Trung bình</option><option value="3">Nâng cao</option></select>' +
    '<select class="select" id="dir-status" aria-label="Trạng thái"><option value="all">Tất cả</option><option value="live">Dùng ngay</option><option value="soon">Sắp ra mắt</option></select></div>' +
    '<div id="dir-count" class="t-small muted"></div><div class="tool-grid" id="dir-grid"></div><nav class="pager" id="dir-pager" aria-label="Phân trang"></nav>' + ad('list', 'Cuối danh sách') + '</div></div></div>';
  const $ = s => main.querySelector(s);
  $('#dir-sort').value = dirState.sort; $('#dir-level').value = dirState.level; $('#dir-status').value = dirState.status;
  const PER = 24;
  function draw() {
    let list = ALL.filter(t => !cat || t.cat === cat.id);
    if (dirState.q) { const r = search(dirState.q, 999); const set = new Set(r); list = r.filter(t => list.includes(t)); void set; }
    if (dirState.level !== '0') list = list.filter(t => String(t.level) === dirState.level);
    if (dirState.status !== 'all') list = list.filter(t => dirState.status === 'live' ? t.live : !t.live);
    if (!dirState.q) {
      if (dirState.sort === 'pop') list.sort((a, b) => (b.live - a.live) || (b.pop - a.pop) || (a.pri - b.pri) || 0);
      else if (dirState.sort === 'new') list.sort((a, b) => ((b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)) || (b.live - a.live));
      else list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }
    const pages = Math.max(1, Math.ceil(list.length / PER)); dirState.page = Math.min(dirState.page, pages);
    const slice = list.slice((dirState.page - 1) * PER, dirState.page * PER);
    $('#dir-count').textContent = list.length + ' công cụ' + (dirState.q ? ' khớp “' + dirState.q + '”' : '') + ' · ' + list.filter(t => t.live).length + ' dùng ngay';
    $('#dir-grid').innerHTML = slice.length ? slice.map(t => toolCard(t)).join('') : '<div class="empty" style="grid-column:1/-1"><div class="e">🔎</div><b>Không tìm thấy công cụ phù hợp</b><span>Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác.</span></div>';
    hydrate($('#dir-grid'));
    const pg = $('#dir-pager'); pg.innerHTML = '';
    if (pages > 1) {
      const btn = (label, p, cur, dis) => '<button type="button" data-p="' + p + '"' + (cur ? ' aria-current="page"' : '') + (dis ? ' disabled' : '') + '>' + label + '</button>';
      let h = btn('‹', dirState.page - 1, false, dirState.page === 1);
      for (let p = 1; p <= pages; p++) { if (p === 1 || p === pages || Math.abs(p - dirState.page) <= 1) h += btn(p, p, p === dirState.page); else if (Math.abs(p - dirState.page) === 2) h += '<button type="button" disabled>…</button>'; }
      pg.innerHTML = h + btn('›', dirState.page + 1, false, dirState.page === pages);
      pg.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { dirState.page = +b.dataset.p; draw(); main.scrollIntoView(); }));
    }
  }
  let tm;
  $('#dir-q').addEventListener('input', e => { clearTimeout(tm); tm = setTimeout(() => { dirState.q = e.target.value.trim(); dirState.page = 1; draw(); }, 80); });
  ['sort', 'level', 'status'].forEach(k => $('#dir-' + k).addEventListener('change', e => { dirState[k] = e.target.value; dirState.page = 1; draw(); }));
  dirState.page = 1; draw();
  cleanups.push(() => { dirState.q = ''; });
}

function pageFav(main) {
  setMeta({ title: 'Công cụ yêu thích – Tiện Ích Nhanh', desc: 'Các công cụ bạn đã lưu.', canonical: SITE + '/favorites' });
  const list = favs.map(s => BY_SLUG[s]).filter(Boolean), rec = recent.map(s => BY_SLUG[s]).filter(Boolean);
  main.innerHTML = '<div class="wrap stack-lg"><div class="stack"><ol class="crumbs"><li><a href="#">Trang chủ</a></li><li aria-current="page">Yêu thích</li></ol>' +
    '<h1 class="t-h1">Công cụ yêu thích</h1><p class="muted">Lưu trên trình duyệt này, không cần đăng nhập. Bấm ♡ trên thẻ công cụ để thêm.</p></div>' +
    (list.length ? '<div class="tool-grid">' + list.map(t => toolCard(t)).join('') + '</div>' :
      '<div class="card empty"><div class="e">♡</div><b>Chưa có công cụ yêu thích</b><span>Bấm biểu tượng ♡ trên bất kỳ công cụ nào để lưu lại đây.</span><a class="btn btn-primary" href="#pho-bien">Xem công cụ phổ biến</a></div>') +
    (rec.length ? section('Bạn vừa sử dụng', '<div class="tool-grid">' + rec.map(t => toolCard(t, { compact: true })).join('') + '</div>') : '') + '</div>';
}

function relatedOf(t) {
  let list = (t.related || []).map(s => BY_SLUG[s]).filter(Boolean);
  if (list.length < 6) list = list.concat(LIVE.filter(x => x.cat === t.cat && x !== t && !list.includes(x)).sort((a, b) => b.pop - a.pop)).slice(0, 6);
  if (list.length < 6) list = list.concat(popular(12).filter(x => x !== t && !list.includes(x))).slice(0, 6);
  return list.slice(0, 6);
}
const DEFAULT_FAQ = [['Công cụ này có miễn phí không?', 'Có. Bạn dùng không giới hạn và không cần tạo tài khoản.'], ['Dữ liệu của tôi có được gửi lên máy chủ không?', 'Không. Công cụ xử lý ngay trên trình duyệt của bạn.']];
function seoFor(t) {
  const c = CAT[t.cat];
  const h1 = t.h1 || (t.name + ' online');
  const title = t.seoTitle || (t.name + ' Online – Miễn Phí, Nhanh, Không Cần Cài Đặt');
  const desc = t.seoDesc || (t.desc + '. Công cụ miễn phí, dùng ngay trên trình duyệt.');
  const faq = t.faq && t.faq.length ? t.faq : DEFAULT_FAQ;
  const url = SITE + '/tools/' + t.slug;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: h1, url, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' }, description: desc },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: c.name, item: SITE + '/danh-muc/' + c.id }, { '@type': 'ListItem', position: 3, name: t.name, item: url }] }];
  if (t.live) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  return { h1, title, desc, faq, url, ld, cat: c };
}
TI.seoFor = seoFor; TI.relatedOf = t => relatedOf(t); TI.buildIndex = () => buildIndex(); TI.SITE = SITE;
function pageTool(main, t) {
  const c = CAT[t.cat];
  currentSlug = t.slug;
  const S = seoFor(t), h1 = S.h1, seoTitle = S.title, seoDesc = S.desc, faq = S.faq, url = S.url;
  setMeta({ title: seoTitle, desc: seoDesc, canonical: url, ld: S.ld });
  const rel = relatedOf(t);
  const same = LIVE.filter(x => x.cat === t.cat && x !== t).slice(0, 6);
  main.innerHTML = '<div class="wrap stack">' +
    '<ol class="crumbs"><li><a href="#">Trang chủ</a></li><li><a href="#dm-' + c.id + '">' + esc(c.name) + '</a></li><li aria-current="page">' + esc(t.name) + '</li></ol>' +
    '<div class="tool-page"><div class="stack" style="min-width:0">' +
    '<div class="tool-head"><span class="icon-tile lg acc-' + c.acc + '">' + t.icon + '</span><div class="grow"><h1 class="t-h1">' + esc(h1) + '</h1><p>' + esc(t.desc) + '</p></div>' +
    '<div class="row" style="flex-wrap:nowrap"><button class="btn btn-icon" type="button" id="share" data-tip="Sao chép liên kết" aria-label="Sao chép liên kết">' + ICON.link + '</button><button class="btn btn-icon fav-btn" style="width:40px;height:40px;border:1px solid var(--border);border-radius:var(--radius-md)" type="button" data-fav="' + t.slug + '"></button></div></div>' +
    '<div class="card"><div class="tool-body" id="tool-root"></div></div>' +
    (t.live ? '<div class="privacy">' + ICON.lock + '<span>' + (t.server ? esc(t.server) : 'Xử lý trực tiếp trên trình duyệt. Dữ liệu của bạn không được gửi lên máy chủ.') + '</span></div>' : '') +
    '<div data-donate="line"></div>' + ad('tool', 'Trong nội dung') +
    (t.how ? '<section class="card card-pad stack"><h2 class="t-h3">Cách sử dụng</h2><ol class="stack" style="margin:0;padding-left:20px;gap:6px">' + t.how.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol></section>' : '') +
    '<section class="card card-pad faq"><h2 class="t-h3" style="margin-bottom:4px">Câu hỏi thường gặp</h2>' + faq.map(([q, a], i) => '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>').join('') + '</section>' +
    section('Có thể bạn cũng cần', '<div class="tool-grid">' + rel.map(x => toolCard(x)).join('') + '</div>') +
    '</div><aside class="aside">' + ad('sidebar', 'Sidebar') + '<div data-donate="card"></div>' +
    (same.length ? '<div class="card card-pad"><h2 class="t-caption" style="margin-bottom:8px">Cùng danh mục ' + esc(c.name) + '</h2><ul class="link-list">' + same.map(x => '<li><a href="#' + x.slug + '"><span>' + x.icon + '</span>' + esc(x.name) + '</a></li>').join('') + '</ul><a class="t-small" href="#dm-' + c.id + '">Xem tất cả ' + esc(c.name.toLowerCase()) + ' →</a></div>' : '') +
    '<div class="card card-pad stack" style="gap:6px"><h2 class="t-caption">Trang này trên Google</h2><div class="seo-url">' + esc(url.replace('https://', '')) + '</div><div style="color:var(--primary);font-weight:600;font-size:15px;line-height:1.35">' + esc(seoTitle) + '</div><div class="t-small muted">' + esc(seoDesc) + '</div></div>' +
    '</aside></div></div>';
  main.querySelector('#share').addEventListener('click', () => copy(url, t.slug));
  const root = main.querySelector('#tool-root');
  if (t.live) {
    pushRecent(t.slug); track('use', t.slug);
    const started = Date.now(); cleanups.push(() => { const st = store.get('stats', { tools: {}, search: {}, cats: {} }); const x = st.tools[t.slug] = st.tools[t.slug] || {}; x.ms = (x.ms || 0) + (Date.now() - started); store.set('stats', st); });
    try { t.render(root, ctx(t)); } catch (e) { root.innerHTML = '<div class="notice notice-danger">Công cụ gặp lỗi khi tải. Hãy tải lại trang.</div>'; console.error(e); }
  } else {
    root.innerHTML = '<div class="empty" style="padding-block:32px"><div class="e">🛠️</div><b style="color:var(--ink-strong);font-size:18px">Công cụ này đang được phát triển</b><span>“' + esc(t.name) + '” nằm trong lộ trình mở rộng. Trong lúc chờ, bạn có thể dùng các công cụ liên quan bên dưới.</span>' +
      '<div class="row" style="justify-content:center"><span class="badge">' + esc(c.name) + '</span><span class="badge">Đối tượng: ' + esc(t.audience || 'Mọi người') + '</span><span class="badge">Độ khó phát triển: ' + ['', 'Thấp', 'Trung bình', 'Cao'][t.level] + '</span></div>' +
      '<a class="btn btn-primary" href="#dm-' + c.id + '">Xem công cụ ' + esc(c.name.toLowerCase()) + ' dùng được ngay</a></div>';
  }
}
function ctx(t) {
  return {
    slug: t.slug, toast, copy: x => copy(x, t.slug), download, esc, fmt, parseNum, money: TI.money,
    state: (d) => store.get('tool_' + t.slug, d), save: v => store.set('tool_' + t.slug, v),
    onCleanup: f => cleanups.push(f)
  };
}

const INFO = {
  'gioi-thieu': ['Giới thiệu', 'Tiện Ích Nhanh là bộ công cụ online miễn phí cho người Việt. Mục tiêu: bạn cần làm một việc nhỏ, mở website, tìm công cụ và làm xong trong 10–30 giây.'],
  'lien-he': ['Liên hệ', 'Góp ý công cụ mới hoặc báo lỗi qua email: hotro@tienichnhanh.vn. Chúng tôi đọc mọi góp ý và ưu tiên các công cụ được yêu cầu nhiều nhất.'],
  'bao-mat': ['Chính sách bảo mật', 'Các công cụ xử lý trực tiếp trên trình duyệt sẽ không gửi dữ liệu của bạn lên máy chủ. Danh sách yêu thích và công cụ vừa dùng được lưu trong bộ nhớ trình duyệt (localStorage) và bạn có thể xóa bất cứ lúc nào.'],
  'dieu-khoan': ['Điều khoản sử dụng', 'Công cụ được cung cấp miễn phí cho mục đích tham khảo. Với các kết quả tài chính, thuế, lương, hãy đối chiếu với quy định hiện hành trước khi sử dụng chính thức.'],
  'cookie': ['Chính sách cookie', 'Website dùng bộ nhớ trình duyệt để ghi nhớ giao diện sáng/tối, công cụ yêu thích và lịch sử sử dụng. Không dùng cookie quảng cáo khi bạn chưa đồng ý.']
};
function pageInfo(main, k) {
  const [title, body] = INFO[k];
  setMeta({ title: title + ' – Tiện Ích Nhanh', desc: body.slice(0, 150), canonical: SITE + '/' + k });
  main.innerHTML = '<div class="wrap stack"><ol class="crumbs"><li><a href="#">Trang chủ</a></li><li aria-current="page">' + title + '</li></ol><h1 class="t-h1">' + title + '</h1><div class="prose"><p>' + esc(body) + '</p></div>' +
    (k === 'bao-mat' ? '<div><button class="btn btn-danger" type="button" id="clear">Xóa dữ liệu lưu trên trình duyệt này</button></div>' : '') + '</div>';
  const b = main.querySelector('#clear'); if (b) b.addEventListener('click', () => { ['favs', 'recent', 'stats'].forEach(x => store.set(x, x === 'stats' ? { tools: {}, search: {}, cats: {} } : [])); favs = []; recent = []; toast('Đã xóa dữ liệu'); });
}

function page404(main) {
  setMeta({ title: 'Không tìm thấy trang – Tiện Ích Nhanh', desc: 'Trang bạn tìm không tồn tại.' });
  main.innerHTML = '<div class="wrap"><div class="nf"><div class="nf-code">404</div><h1 class="t-h1">Có vẻ công cụ này chưa được phát minh 😅</h1><p class="muted">Đường dẫn không tồn tại hoặc đã đổi tên. Thử tìm công cụ khác nhé.</p><div id="nf-search" style="width:100%;display:flex;justify-content:center"></div>' +
    '<div class="chips" style="justify-content:center"><a class="chip" href="#pho-bien">🔥 Công cụ phổ biến</a><a class="chip" href="#dm-random">🎲 Random</a><a class="chip" href="#dm-calc">🧮 Máy tính</a><a class="chip" href="#dm-text">✍️ Văn bản</a></div></div>' +
    section('Công cụ phổ biến', '<div class="tool-grid">' + popular(8).map(t => toolCard(t)).join('') + '</div>') + '</div>';
  mountSearch(main.querySelector('#nf-search'), { size: 'search-lg', placeholder: 'Tìm một công cụ khác…' });
}

/* Admin preview: kiến trúc sẵn cho dashboard quản trị (dữ liệu thật sẽ đến từ API) */
function pageAdmin(main) {
  setMeta({ title: 'Quản trị – Tiện Ích Nhanh', desc: 'Bảng quản trị' });
  const st = store.get('stats', { tools: {}, search: {}, cats: {} });
  const rows = ALL.map(t => ({ t, s: st.tools[t.slug] || {} })).sort((a, b) => (b.s.use || 0) - (a.s.use || 0) || (b.t.live - a.t.live));
  const kw = Object.entries(st.search).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const cats = Object.entries(st.cats).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const sum = k => rows.reduce((n, r) => n + (r.s[k] || 0), 0);
  main.innerHTML = '<div class="wrap stack"><ol class="crumbs"><li><a href="#">Trang chủ</a></li><li aria-current="page">Quản trị</li></ol>' +
    '<div class="spread"><h1 class="t-h1">Bảng quản trị</h1><span class="badge badge-primary">Bản xem trước · dữ liệu trên thiết bị này</span></div>' +
    '<div class="stat-grid">' + [['Công cụ dùng ngay', LIVE.length], ['Tổng trong kho', ALL.length], ['Lượt mở tool', sum('use')], ['Lượt sao chép', sum('copy')], ['Lượt tải xuống', sum('download')], ['Lượt yêu thích', sum('favorite')]].map(([l, v]) => '<div class="stat"><div class="stat-label">' + l + '</div><div class="stat-value">' + fmt(v, 0) + '</div></div>').join('') + '</div>' +
    '<div class="split"><div class="card card-pad"><h2 class="t-h3" style="margin-bottom:8px">Từ khóa tìm kiếm</h2>' + (kw.length ? '<ul class="history">' + kw.map(([k, n]) => '<li><span>' + esc(k) + '</span><span>' + n + '</span></li>').join('') + '</ul>' : '<p class="muted t-small">Chưa có lượt tìm kiếm.</p>') + '</div>' +
    '<div class="card card-pad"><h2 class="t-h3" style="margin-bottom:8px">Danh mục được xem</h2>' + (cats.length ? '<ul class="history">' + cats.map(([k, n]) => '<li><span>' + CAT[k].icon + ' ' + esc(CAT[k].name) + '</span><span>' + n + '</span></li>').join('') + '</ul>' : '<p class="muted t-small">Chưa có dữ liệu.</p>') + '</div></div>' +
    '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Công cụ</th><th>Danh mục</th><th>Trạng thái</th><th>Mở</th><th>Copy</th><th>Tải</th><th>Thời gian dùng</th></tr></thead><tbody>' +
    rows.slice(0, 60).map(({ t, s }) => '<tr><td><a href="#' + t.slug + '">' + esc(t.name) + '</a></td><td>' + esc(CAT[t.cat].name) + '</td><td>' + (t.live ? 'Đang chạy' : 'Lộ trình') + '</td><td>' + (s.use || 0) + '</td><td>' + (s.copy || 0) + '</td><td>' + (s.download || 0) + '</td><td>' + (s.ms ? Math.round(s.ms / 1000) + ' giây' : '—') + '</td></tr>').join('') +
    '</tbody></table></div></div><p class="t-small muted">Thêm/sửa tool, SEO, related tools và vị trí quảng cáo sẽ đọc–ghi qua API registry; mỗi tool là một bản ghi cùng cấu trúc với TI.define().</p></div>';
}

/* ---------- Shell ---------- */
function theme(next) {
  const root = document.documentElement;
  const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const t = next || (cur === 'dark' ? 'light' : 'dark');
  root.setAttribute('data-theme', t); store.set('theme', t);
  document.querySelectorAll('.theme-btn').forEach(b => { b.innerHTML = t === 'dark' ? ICON.sun : ICON.moon; b.setAttribute('aria-label', t === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'); });
}
function closeOverlays() { document.querySelectorAll('.drawer,.search-sheet').forEach(x => x.remove()); document.body.style.overflow = ''; }
function openSearchSheet() {
  closeOverlays();
  const s = document.createElement('div'); s.className = 'search-sheet'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-label', 'Tìm kiếm');
  s.innerHTML = '<div class="row" style="flex-wrap:nowrap"><div id="sheet-s" style="flex:1"></div><button class="btn btn-ghost" type="button" id="sheet-x">Đóng</button></div><div class="t-caption" style="padding:0 4px"></div>';
  document.body.appendChild(s); document.body.style.overflow = 'hidden';
  mountSearch(s.querySelector('#sheet-s'), { placeholder: 'Bạn đang cần công cụ gì?', autofocus: true, inline: true });
  s.querySelector('#sheet-x').addEventListener('click', closeOverlays);
}
function openDrawer() {
  closeOverlays();
  const d = document.createElement('div'); d.className = 'drawer';
  d.innerHTML = '<div class="drawer-panel" role="dialog" aria-label="Menu"><div class="spread"><a class="logo" href="#">' + LOGO + '<span>Tiện Ích Nhanh</span></a><button class="btn btn-ghost btn-icon" type="button" id="dr-x" aria-label="Đóng menu">' + ICON.x + '</button></div>' +
    '<nav class="drawer-links"><a href="#">🏠 Trang chủ</a><a href="#tools">🗂️ Tất cả công cụ</a><a href="#pho-bien">🔥 Công cụ phổ biến</a><a href="#moi">✨ Công cụ mới</a><a href="#favorites">♡ Yêu thích</a></nav>' +
    '<div class="t-caption">Danh mục</div><nav class="drawer-links">' + CATS.map(c => '<a href="#dm-' + c.id + '">' + c.icon + ' ' + esc(c.name) + '</a>').join('') + '</nav>' +
    '<div class="t-caption">Thông tin</div><nav class="drawer-links"><a href="#gioi-thieu">Giới thiệu</a><a href="#lien-he">Liên hệ</a><a href="#bao-mat">Chính sách bảo mật</a><a href="#ung-ho">☕ Ủng hộ dự án</a><a href="#admin">Bảng quản trị (xem trước)</a></nav></div>';
  document.body.appendChild(d); document.body.style.overflow = 'hidden';
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('#dr-x') || e.target.closest('a')) closeOverlays(); });
}
function shell() {
  const hdr = document.getElementById('hdr');
  hdr.innerHTML = '<div class="wrap hdr-in"><a class="logo" href="#" aria-label="Tiện Ích Nhanh – Trang chủ">' + LOGO + '<span>Tiện Ích Nhanh</span></a>' +
    '<nav class="nav" aria-label="Chính"><a href="#" data-nav="home">Trang chủ</a><a href="#tools" data-nav="tools">Danh mục</a><a href="#pho-bien" data-nav="pop">Công cụ phổ biến</a><a href="#moi" data-nav="new">Công cụ mới</a><a href="#favorites" data-nav="fav">Yêu thích</a></nav>' +
    '<div class="hdr-search" id="hdr-search"></div><div class="hdr-actions"><button class="btn btn-ghost btn-icon hdr-m-search" type="button" aria-label="Tìm kiếm" id="m-search">' + ICON.search + '</button>' +
    '<button class="btn btn-ghost btn-icon theme-btn" type="button"></button><button class="btn btn-ghost btn-icon" type="button" aria-label="Mở menu" id="menu-btn">' + ICON.menu + '</button></div></div>';
  mountSearch(hdr.querySelector('#hdr-search'), { placeholder: 'Tìm công cụ…' });
  hdr.querySelector('#m-search').addEventListener('click', openSearchSheet);
  hdr.querySelector('#menu-btn').addEventListener('click', openDrawer);
  document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', () => theme()));
  const bn = document.getElementById('bnav');
  bn.innerHTML = '<a href="#" data-nav="home">' + ICON.home + 'Trang chủ</a><a href="#tools" data-nav="tools">' + ICON.grid + 'Danh mục</a><button type="button" id="bn-s">' + ICON.search.replace('width="20" height="20" ', '') + 'Tìm kiếm</button><a href="#favorites" data-nav="fav">' + ICON.heart + 'Yêu thích</a><button type="button" id="bn-m">' + ICON.dots + 'Menu</button>';
  bn.querySelector('#bn-s').addEventListener('click', openSearchSheet);
  bn.querySelector('#bn-m').addEventListener('click', openDrawer);
  const ft = document.getElementById('ftr');
  ft.innerHTML = '<div class="wrap"><div class="ftr-grid"><div class="stack" style="gap:10px"><a class="logo" href="#">' + LOGO + '<span>Tiện Ích Nhanh</span></a><p class="t-small muted">Mọi công cụ bạn cần – ngay trên một website. Miễn phí, nhanh, không cần cài đặt.</p></div>' +
    '<div><h4>Công cụ</h4><ul>' + [['text', 'Văn bản'], ['calc', 'Máy tính'], ['image', 'Hình ảnh'], ['pdf', 'PDF'], ['random', 'Random'], ['dev', 'Developer']].map(([k, n]) => '<li><a href="#dm-' + k + '">' + n + '</a></li>').join('') + '</ul></div>' +
    '<div><h4>Phổ biến</h4><ul>' + ['tinh-phan-tram', 'quay-random', 'vong-quay-may-man', 'tao-qr-code', 'tinh-luong-gross-net', 'nen-anh'].map(s => BY_SLUG[s]).filter(Boolean).map(t => '<li><a href="#' + t.slug + '">' + esc(t.name) + '</a></li>').join('') + '</ul></div>' +
    '<div><h4>Thông tin</h4><ul><li><a href="#gioi-thieu">Giới thiệu</a></li><li><a href="#lien-he">Liên hệ</a></li><li><a href="#bao-mat">Chính sách bảo mật</a></li><li><a href="#dieu-khoan">Điều khoản sử dụng</a></li><li><a href="#cookie">Cookie</a></li><li><a href="#ung-ho">☕ Ủng hộ dự án</a></li></ul></div></div>' +
    '<div class="ftr-bottom"><span>© 2026 Tiện Ích Nhanh. Công cụ xử lý trên trình duyệt không gửi dữ liệu của bạn lên máy chủ.</span><span>' + ALL.length + ' công cụ · ' + CATS.length + ' danh mục</span></div></div>';
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { const i = document.querySelector('#hdr-search input'); if (i && i.offsetParent) { e.preventDefault(); i.focus(); } else { e.preventDefault(); openSearchSheet(); } }
    if (e.key === 'Escape') closeOverlays();
  });
}
TI.boot = function () {
  buildIndex(); loadAds();
  const saved = store.get('theme', null); if (saved) document.documentElement.setAttribute('data-theme', saved);
  shell(); theme(document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  if (!saved) { document.documentElement.removeAttribute('data-theme'); store.set('theme', null); }
  if (PATH) {
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches('a[href^="#"]')) fixLinks(n.parentNode || n); else fixLinks(n); } }))).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="/"]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      e.preventDefault(); closeOverlays(); go(pathToTok(a.getAttribute('href')));
    });
    window.addEventListener('popstate', () => { closeOverlays(); route(); });
  } else window.addEventListener('hashchange', () => { closeOverlays(); route(); });
  route();
};
})();
