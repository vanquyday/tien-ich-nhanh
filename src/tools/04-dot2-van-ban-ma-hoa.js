/* Đợt 2 — nhóm dễ triển khai nhất: tools/text/* (xử lý văn bản) + tools/developer/* (mã hóa vui, URL, HTML).
   Tất cả dùng chung một khuôn: Văn bản vào → tùy chọn → Văn bản ra. */
(function () {
const TI = window.TI, U = TI.ui, D = TI.define, esc = TI.esc, fmt = TI.fmt;

/* ---------- Khuôn dùng chung: transform tool ---------- */
function transform({ ph = 'Dán văn bản vào đây…', sample = '', opts = '', fn, mono = false, outLabel = 'Kết quả', inLabel = 'Văn bản đầu vào', extra = '', after }) {
  return (root, ctx) => {
    root.innerHTML = extra + '<div class="split"><div class="field"><label class="label" for="in">' + esc(inLabel) + '</label><textarea class="textarea' + (mono ? ' mono' : '') + '" id="in" rows="10" spellcheck="false" placeholder="' + esc(ph) + '"></textarea></div>' +
      '<div class="field"><span class="label">' + esc(outLabel) + '</span><div class="out-box" id="out" aria-live="polite" style="min-height:230px' + (mono ? '' : ';font-family:var(--font-sans);font-size:15px') + '"></div></div></div>' +
      (opts ? '<div class="form-grid" id="opts">' + opts + '</div>' : '') +
      '<div class="spread"><span class="t-small muted" id="info"></span><div class="btn-row"><button class="btn btn-ghost" type="button" id="clr">Xóa</button><button class="btn" type="button" id="use">Dùng kết quả làm đầu vào</button><button class="btn" type="button" id="dl">Tải .txt</button><button class="btn btn-primary" type="button" id="cp">Sao chép kết quả</button></div></div>';
    const inp = U.$(root, '#in'), out = U.$(root, '#out'), info = U.$(root, '#info');
    inp.value = sample;
    const o = id => { const el = U.$(root, '#' + id); return !el ? undefined : el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value; };
    const run = () => {
      let r; try { r = fn(inp.value, o, root); } catch (e) { r = { out: '', info: 'Lỗi: ' + e.message, error: true }; }
      if (typeof r === 'string') r = { out: r };
      out.textContent = r.out || ''; out.dataset.v = r.out || '';
      out.style.color = r.error ? 'var(--danger)' : '';
      info.textContent = r.info != null ? r.info : (inp.value ? fmt([...inp.value].length, 0) + ' → ' + fmt([...(r.out || '')].length, 0) + ' ký tự' : '');
    };
    root.addEventListener('input', run); root.addEventListener('change', run);
    U.$(root, '#clr').onclick = () => { inp.value = ''; run(); inp.focus(); };
    U.$(root, '#use').onclick = () => { if (!out.dataset.v) return ctx.toast('Chưa có kết quả'); inp.value = out.dataset.v; run(); };
    U.$(root, '#dl').onclick = () => out.dataset.v ? ctx.download('ket-qua.txt', out.dataset.v) : ctx.toast('Chưa có kết quả');
    U.$(root, '#cp').onclick = () => out.dataset.v ? ctx.copy(out.dataset.v) : ctx.toast('Chưa có kết quả');
    if (after) after(root, run, ctx);
    run();
  };
}
const chk = (id, label, on) => '<label class="check"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '>' + esc(label) + '</label>';
const sel = (id, label, options, v) => U.select(id, label, options, v);
const txt = (id, label, v, ph) => '<div class="field"><label class="label" for="' + id + '">' + esc(label) + '</label><input class="input" id="' + id + '" value="' + esc(v || '') + '" placeholder="' + esc(ph || '') + '" autocomplete="off"></div>';
const lines = s => s.split(/\r?\n/);
const LIST = 'Hà Nội\nĐà Nẵng\nhà nội\nCần Thơ\nHải Phòng\nTP. Hồ Chí Minh\nĐà Nẵng\nHuế\n\nNha Trang';
const coll = new Intl.Collator('vi', { numeric: true, sensitivity: 'base' });
const collCase = new Intl.Collator('vi', { numeric: true, sensitivity: 'variant', caseFirst: 'upper' });
const meta = (o) => Object.assign({ isNew: true, level: 1 }, o);

/* ---------- text: dòng trùng ---------- */
D(meta({ slug: 'xoa-dong-trung', name: 'Xóa dòng trùng', cat: 'text', icon: '🧽', desc: 'Lọc bỏ các dòng giống nhau, giữ nguyên thứ tự lần xuất hiện đầu', pop: 74,
  kw: 'remove duplicate lines deduplicate loc trung xoa trung lap danh sach unique dong trung email trung', h1: 'Xóa dòng trùng lặp online',
  aliases: ['text-deduplicator', 'duplicate-finder'], related: ['sap-xep-a-sang-z', 'xoa-khoang-trang', 'tron-ngau-nhien-dong', 'csv-cleaner'],
  faq: [['Có giữ thứ tự ban đầu không?', 'Có. Dòng xuất hiện đầu tiên được giữ lại, các bản lặp phía sau bị bỏ.'], ['“Hà Nội” và “hà nội” có tính là trùng không?', 'Tùy bạn: bật “Không phân biệt hoa thường” để coi là trùng.']],
  render: transform({ sample: LIST, opts: chk('ci', 'Không phân biệt hoa thường', true) + chk('tr', 'Bỏ khoảng trắng đầu/cuối dòng', true) + chk('em', 'Xóa dòng trống', true) + chk('show', 'Chỉ hiện các dòng bị trùng', false),
    fn: (s, o) => { const seen = new Map(), out = [], dup = new Set(); let removed = 0;
      lines(s).forEach(l => { const v = o('tr') ? l.trim() : l; if (o('em') && !v.trim()) return; const k = o('ci') ? v.toLocaleLowerCase('vi') : v; if (seen.has(k)) { removed++; dup.add(seen.get(k)); } else { seen.set(k, v); out.push(v); } });
      return { out: (o('show') ? [...dup] : out).join('\n'), info: s ? 'Đã bỏ ' + removed + ' dòng trùng · còn ' + out.length + ' dòng' : '' }; } }) }));

/* ---------- text: ký tự trùng ---------- */
D(meta({ slug: 'xoa-ky-tu-trung', name: 'Xóa ký tự trùng', cat: 'text', icon: '🔡', desc: 'Bỏ ký tự lặp liên tiếp hoặc chỉ giữ lần xuất hiện đầu của mỗi ký tự', pop: 40,
  kw: 'remove duplicate characters loc ky tu trung ky tu lap aaa', related: ['xoa-dong-trung', 'xoa-khoang-trang', 'tim-va-thay-the'],
  render: transform({ sample: 'Tuyệttttt vờiiii!!! Cảm ơnnn bạn nhiềuuu', opts: sel('mode', 'Cách lọc', [['run', 'Bỏ ký tự lặp liên tiếp (aaa → a)'], ['first', 'Mỗi ký tự chỉ giữ lần đầu']], 'run') + chk('sp', 'Giữ nguyên khoảng trắng', true),
    fn: (s, o) => { const ch = [...s]; if (o('mode') === 'run') return ch.filter((c, i) => i === 0 || c !== ch[i - 1] || (o('sp') && /\s/.test(c) && false)).join('');
      const seen = new Set(); return ch.filter(c => { if (o('sp') && /\s/.test(c)) return true; if (seen.has(c)) return false; seen.add(c); return true; }).join(''); } }) }));

/* ---------- text: sắp xếp ---------- */
function sorter(kind) {
  return transform({ sample: LIST, opts: chk('em', 'Xóa dòng trống', true) + chk('tr', 'Bỏ khoảng trắng đầu/cuối', true) + (kind === 'len' ? sel('dir', 'Thứ tự', [['asc', 'Ngắn → dài'], ['desc', 'Dài → ngắn']], 'asc') : chk('cs', 'Phân biệt hoa thường', false)) + (kind === 'shuffle' ? '' : chk('uq', 'Đồng thời xóa dòng trùng', false)),
    fn: (s, o) => { let a = lines(s).map(l => o('tr') ? l.trim() : l); if (o('em')) a = a.filter(l => l.trim());
      if (o('uq')) a = [...new Set(a)];
      if (kind === 'az' || kind === 'za') { const c = o('cs') ? collCase : coll; a.sort(c.compare); if (kind === 'za') a.reverse(); }
      else if (kind === 'len') { a.sort((x, y) => [...x].length - [...y].length || coll.compare(x, y)); if (o('dir') === 'desc') a.reverse(); }
      else a = U.shuffle(a);
      return { out: a.join('\n'), info: s ? a.length + ' dòng' : '' }; },
    after: kind === 'shuffle' ? (root, run) => { const b = document.createElement('button'); b.className = 'btn btn-soft'; b.type = 'button'; b.textContent = '🔀 Trộn lại'; b.onclick = run; U.$(root, '.btn-row').prepend(b); } : null });
}
const sortFaq = [['Sắp xếp tiếng Việt có đúng thứ tự không?', 'Có. Công cụ dùng quy tắc so sánh tiếng Việt của trình duyệt: “Đà Nẵng” đứng sau “Cần Thơ”, số được so như số tự nhiên (2 trước 10).']];
D(meta({ slug: 'sap-xep-a-sang-z', name: 'Sắp xếp A → Z', cat: 'text', icon: '🔤', desc: 'Sắp xếp danh sách theo bảng chữ cái tiếng Việt, tăng dần', pop: 72,
  kw: 'sort lines alphabetical sap xep danh sach theo abc a z bang chu cai text sorter sort', h1: 'Sắp xếp danh sách A → Z', aliases: ['text-sorter'], related: ['sap-xep-z-sang-a', 'sap-xep-theo-do-dai', 'xoa-dong-trung', 'tron-ngau-nhien-dong'], faq: sortFaq, render: sorter('az') }));
D(meta({ slug: 'sap-xep-z-sang-a', name: 'Sắp xếp Z → A', cat: 'text', icon: '🔠', desc: 'Sắp xếp danh sách theo bảng chữ cái tiếng Việt, giảm dần', pop: 50,
  kw: 'sort lines reverse alphabetical sap xep giam dan z a', h1: 'Sắp xếp danh sách Z → A', related: ['sap-xep-a-sang-z', 'sap-xep-theo-do-dai', 'xoa-dong-trung'], faq: sortFaq, render: sorter('za') }));
D(meta({ slug: 'sap-xep-theo-do-dai', name: 'Sắp xếp theo độ dài', cat: 'text', icon: '📶', desc: 'Sắp xếp các dòng theo số ký tự, ngắn trước hoặc dài trước', pop: 42,
  kw: 'sort by length sap xep theo do dai so ky tu dong ngan dai', related: ['sap-xep-a-sang-z', 'dem-ky-tu', 'xoa-dong-trung'], render: sorter('len') }));
D(meta({ slug: 'tron-ngau-nhien-dong', name: 'Trộn ngẫu nhiên dòng', cat: 'text', icon: '🔀', desc: 'Xáo trộn thứ tự các dòng trong danh sách một cách ngẫu nhiên', pop: 58,
  kw: 'shuffle lines random order xao tron danh sach tron dong ngau nhien random thu tu', h1: 'Trộn ngẫu nhiên danh sách', aliases: ['xao-tron-danh-sach'], related: ['quay-random', 'chia-doi', 'sap-xep-a-sang-z'], render: sorter('shuffle') }));

/* ---------- text: tìm & thay thế ---------- */
D(meta({ slug: 'tim-va-thay-the', name: 'Tìm & thay thế', cat: 'text', icon: '🔍', desc: 'Tìm và thay thế hàng loạt từ, cụm từ hoặc biểu thức chính quy', pop: 70,
  kw: 'find and replace tim kiem thay the replace all regex doi tu hang loat', h1: 'Tìm và thay thế văn bản online', related: ['xoa-khoang-trang', 'doi-chu-hoa-thuong', 'xoa-dong-trung'],
  faq: [['Có thay thế bằng regex được không?', 'Có. Bật “Biểu thức chính quy”, có thể dùng $1, $2 trong ô thay thế.']],
  render: transform({ sample: 'Cửa hàng mở cửa từ 8h đến 22h. Cửa hàng nghỉ thứ Hai.\nLiên hệ cửa hàng qua số 0901 234 567.',
    extra: '<div class="form-grid">' + txt('find', 'Tìm', 'Cửa hàng') + txt('rep', 'Thay bằng', 'Shop') + '</div>',
    opts: chk('cs', 'Phân biệt hoa thường', false) + chk('wd', 'Chỉ khớp nguyên từ', false) + chk('rx', 'Biểu thức chính quy (regex)', false),
    fn: (s, o) => { const f = o('find'); if (!f) return { out: s, info: 'Nhập từ cần tìm' };
      let src = o('rx') ? f : f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); if (o('wd')) src = '(?<![\\p{L}\\p{N}])' + src + '(?![\\p{L}\\p{N}])';
      const re = new RegExp(src, 'gu' + (o('cs') ? '' : 'i')); const n = (s.match(re) || []).length;
      return { out: s.replace(re, o('rx') ? o('rep') : o('rep').replace(/\$/g, '$$$$')), info: 'Đã thay ' + n + ' chỗ' }; } }) }));

/* ---------- text: so sánh 2 văn bản ---------- */
function diffLines(a, b) {
  const n = a.length, m = b.length; if (n * m > 4e6) throw new Error('Văn bản quá dài để so sánh (tối đa khoảng 2.000 dòng mỗi bên)');
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) { if (a[i] === b[j]) { out.push([' ', a[i]]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) out.push(['-', a[i++]]); else out.push(['+', b[j++]]); }
  while (i < n) out.push(['-', a[i++]]); while (j < m) out.push(['+', b[j++]]); return out;
}
D(meta({ slug: 'so-sanh-2-van-ban', name: 'So sánh 2 văn bản', cat: 'text', icon: '🆚', desc: 'Tìm dòng được thêm, bị xóa giữa hai phiên bản văn bản', pop: 66, level: 2,
  kw: 'text compare diff checker so sanh van ban khac nhau doi chieu hai doan diff', h1: 'So sánh hai văn bản online', related: ['tim-va-thay-the', 'xoa-dong-trung', 'dem-tu'],
  render(root, ctx) {
    root.innerHTML = '<div class="split"><div class="field"><label class="label" for="a">Bản gốc</label><textarea class="textarea" id="a" rows="8" spellcheck="false">Giờ mở cửa: 8h – 22h\nGiao hàng toàn quốc\nĐổi trả trong 7 ngày\nHotline: 0901 234 567</textarea></div>' +
      '<div class="field"><label class="label" for="b">Bản mới</label><textarea class="textarea" id="b" rows="8" spellcheck="false">Giờ mở cửa: 8h – 21h30\nGiao hàng toàn quốc\nĐổi trả trong 15 ngày\nMiễn phí vận chuyển đơn từ 300K\nHotline: 0901 234 567</textarea></div></div>' +
      '<div class="row">' + chk('ci', 'Bỏ qua hoa thường', false) + chk('ws', 'Bỏ qua khoảng trắng thừa', true) + '</div>' +
      '<div class="stat-grid"><div class="stat"><div class="stat-label">Dòng thêm</div><div class="stat-value" id="nadd" style="color:var(--success)">0</div></div><div class="stat"><div class="stat-label">Dòng xóa</div><div class="stat-value" id="ndel" style="color:var(--danger)">0</div></div><div class="stat"><div class="stat-label">Giống nhau</div><div class="stat-value" id="nsame">0</div></div></div>' +
      '<div class="out-box" id="out" style="white-space:normal;padding:6px"></div><div class="btn-row"><button class="btn" type="button" id="cp">Sao chép kết quả dạng diff</button></div>';
    let txtOut = '';
    const run = () => {
      const prep = s => { let x = s; if (U.$(root, '#ws').checked) x = x.replace(/\s+/g, ' ').trim(); if (U.$(root, '#ci').checked) x = x.toLocaleLowerCase('vi'); return x; };
      const A = lines(U.$(root, '#a').value), B = lines(U.$(root, '#b').value);
      let d; try { d = diffLines(A.map(prep), B.map(prep)); } catch (e) { U.$(root, '#out').textContent = e.message; return; }
      let ia = 0, ib = 0; const rows = d.map(([k]) => k === ' ' ? [' ', A[ia++], ib++] : k === '-' ? ['-', A[ia++]] : ['+', B[ib++]]);
      const c = k => rows.filter(r => r[0] === k).length;
      U.$(root, '#nadd').textContent = c('+'); U.$(root, '#ndel').textContent = c('-'); U.$(root, '#nsame').textContent = c(' ');
      U.$(root, '#out').innerHTML = rows.map(([k, l]) => '<div style="display:flex;gap:8px;padding:2px 8px;border-radius:4px;' + (k === '+' ? 'background:var(--success-soft);color:var(--success)' : k === '-' ? 'background:var(--danger-soft);color:var(--danger);text-decoration:line-through' : '') + '"><b style="width:12px;flex:none">' + (k === ' ' ? '' : k) + '</b><span style="white-space:pre-wrap;overflow-wrap:anywhere">' + (esc(l) || '&nbsp;') + '</span></div>').join('');
      txtOut = rows.map(([k, l]) => k + ' ' + l).join('\n');
    };
    root.addEventListener('input', run); root.addEventListener('change', run); U.$(root, '#cp').onclick = () => ctx.copy(txtOut); run();
  } }));

/* ---------- text: lorem ipsum ---------- */
const LOREM = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
const VIET = 'cửa hàng sản phẩm khách hàng chất lượng dịch vụ giao hàng nhanh chóng tiện lợi mỗi ngày gia đình công việc học tập thành phố buổi sáng cà phê bạn bè ưu đãi hấp dẫn thiết kế hiện đại đơn giản tự nhiên bền vững trải nghiệm tuyệt vời hỗ trợ tận tâm uy tín giá tốt mới nhất phù hợp'.split(' ');
D(meta({ slug: 'lorem-ipsum-generator', name: 'Lorem Ipsum Generator', cat: 'text', icon: '📃', desc: 'Tạo văn bản mẫu Lorem Ipsum hoặc tiếng Việt cho bản thiết kế', pop: 52,
  kw: 'lorem ipsum generator van ban mau dummy text placeholder text tieng viet mau', h1: 'Tạo văn bản mẫu Lorem Ipsum', related: ['dem-tu', 'slug-generator', 'text-repeater'],
  render(root, ctx) {
    root.innerHTML = '<div class="form-grid">' + U.select('lang', 'Ngôn ngữ', [['la', 'Lorem Ipsum (Latin)'], ['vi', 'Tiếng Việt mẫu']], 'la') + U.num('p', 'Số đoạn', { value: '3', mode: 'numeric' }) + U.num('w', 'Số từ mỗi đoạn', { value: '45', mode: 'numeric' }) + '</div>' +
      '<div class="row">' + chk('start', 'Bắt đầu bằng “Lorem ipsum dolor sit amet”', true) + chk('html', 'Bọc thẻ <p>', false) + '</div>' +
      '<button class="btn btn-primary btn-lg btn-block" type="button" id="go">Tạo văn bản mẫu</button><div class="out-box" id="out" style="font-family:var(--font-sans);font-size:15px;line-height:1.7"></div>' +
      '<div class="btn-row"><button class="btn btn-primary" type="button" id="cp">Sao chép</button><button class="btn" type="button" id="dl">Tải .txt</button></div>';
    const go = () => { const vi = U.$(root, '#lang').value === 'vi', bank = vi ? VIET : LOREM, P = Math.max(1, Math.min(50, U.val(root, 'p') || 3)), W = Math.max(5, Math.min(500, U.val(root, 'w') || 45));
      const paras = Array.from({ length: P }, (_, pi) => { const w = Array.from({ length: W }, () => bank[U.rand(bank.length)]); if (pi === 0 && !vi && U.$(root, '#start').checked) w.splice(0, 5, 'lorem', 'ipsum', 'dolor', 'sit', 'amet');
        let s = '', cap = true; w.forEach((x, i) => { s += (i ? ' ' : '') + (cap ? x[0].toUpperCase() + x.slice(1) : x); cap = false; if (i < w.length - 1 && U.rand(9) === 0) { s += U.rand(3) ? ',' : '.'; cap = s.endsWith('.'); } }); return s + '.'; });
      U.$(root, '#out').textContent = U.$(root, '#html').checked ? paras.map(p => '<p>' + p + '</p>').join('\n') : paras.join('\n\n'); };
    U.$(root, '#go').onclick = go; root.addEventListener('change', go);
    U.$(root, '#cp').onclick = () => ctx.copy(U.$(root, '#out').textContent); U.$(root, '#dl').onclick = () => ctx.download('van-ban-mau.txt', U.$(root, '#out').textContent); go();
  } }));

/* ---------- text: slug ---------- */
D(meta({ slug: 'slug-generator', name: 'Tạo slug URL', cat: 'text', icon: '🔗', desc: 'Chuyển tiêu đề tiếng Việt thành đường dẫn URL không dấu, thân thiện SEO', pop: 64,
  kw: 'slug generator tao slug url seo friendly duong dan khong dau permalink chuyen tieu de', h1: 'Tạo slug URL tiếng Việt không dấu', related: ['doi-chu-hoa-thuong', 'url-encoder', 'meta-title-counter', 'xoa-khoang-trang'],
  faq: [['Slug là gì?', 'Là phần cuối của đường dẫn, ví dụ /tools/tinh-phan-tram. Slug ngắn, không dấu, nối bằng gạch ngang giúp SEO tốt hơn.'], ['Có xử lý được chữ “đ” không?', 'Có. “Đường” thành “duong”.']],
  render: transform({ sample: 'Cách Tính Phần Trăm Nhanh Nhất 2026!\nTop 10 Quán Cà Phê Đẹp ở Đà Lạt', inLabel: 'Tiêu đề (mỗi dòng một tiêu đề)', outLabel: 'Slug', mono: true,
    opts: sel('sep', 'Ký tự nối', [['-', 'Gạch ngang (-)'], ['_', 'Gạch dưới (_)']], '-') + U.num('max', 'Độ dài tối đa (0 = không giới hạn)', { value: '0', mode: 'numeric' }) + chk('stop', 'Bỏ từ ngắn vô nghĩa (và, của, các…)', false),
    fn: (s, o) => { const sp = o('sep'), max = TI.parseNum(o('max')) || 0; const STOP = new Set(['va', 'cua', 'cac', 'nhung', 'la', 'o', 'cho', 'voi', 'the', 'a', 'an', 'of', 'and']);
      return lines(s).filter(l => l.trim()).map(l => { let w = U.noAccent(l).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean); if (o('stop')) w = w.filter(x => !STOP.has(x));
        let r = w.join(sp); if (max && r.length > max) { r = r.slice(0, max); r = r.slice(0, r.lastIndexOf(sp) > 0 ? r.lastIndexOf(sp) : max); } return r; }).join('\n'); } }) }));

/* ---------- text: lặp văn bản ---------- */
D(meta({ slug: 'text-repeater', name: 'Lặp lại văn bản', cat: 'text', icon: '🔁', desc: 'Nhân bản một đoạn chữ nhiều lần, chọn ký tự ngăn cách', pop: 38,
  kw: 'text repeater lap lai van ban nhan ban chu repeat text spam lap tu', related: ['lorem-ipsum-generator', 'list-to-text', 'dem-ky-tu'],
  render: transform({ sample: 'Chúc mừng năm mới! 🎉', opts: U.num('n', 'Số lần lặp', { value: '5', mode: 'numeric' }) + sel('sep', 'Ngăn cách', [['nl', 'Xuống dòng'], ['sp', 'Dấu cách'], ['none', 'Không có'], ['comma', 'Dấu phẩy']], 'nl') + chk('num', 'Đánh số thứ tự', false),
    fn: (s, o) => { const n = Math.max(1, Math.min(10000, Math.round(TI.parseNum(o('n'))) || 1)); const sep = { nl: '\n', sp: ' ', none: '', comma: ', ' }[o('sep')];
      return { out: Array.from({ length: n }, (_, i) => (o('num') ? (i + 1) + '. ' : '') + s).join(sep), info: 'Lặp ' + n + ' lần' }; } }) }));

/* ---------- text: văn bản ↔ danh sách ---------- */
D(meta({ slug: 'text-to-list', name: 'Tách văn bản thành danh sách', cat: 'text', icon: '📋', desc: 'Tách chuỗi theo dấu phẩy, chấm phẩy, khoảng trắng thành từng dòng', pop: 46,
  kw: 'text to list split string tach chuoi tach dau phay thanh dong danh sach comma separated', related: ['list-to-text', 'xoa-dong-trung', 'sap-xep-a-sang-z'],
  render: transform({ sample: 'táo, cam, xoài, chuối, ổi, táo', opts: sel('d', 'Tách theo', [['comma', 'Dấu phẩy (,)'], ['semi', 'Chấm phẩy (;)'], ['space', 'Khoảng trắng'], ['tab', 'Tab'], ['custom', 'Ký tự tự chọn']], 'comma') + txt('cus', 'Ký tự tự chọn', '|') +
    sel('pre', 'Đầu dòng', [['none', 'Không'], ['dash', 'Gạch đầu dòng (- )'], ['num', 'Đánh số (1. )']], 'none') + chk('tr', 'Bỏ khoảng trắng thừa', true) + chk('em', 'Bỏ mục rỗng', true),
    fn: (s, o) => { const d = { comma: ',', semi: ';', space: /\s+/, tab: '\t', custom: o('cus') || ',' }[o('d')];
      let a = s.split(d); if (o('tr')) a = a.map(x => x.trim()); if (o('em')) a = a.filter(x => x);
      return { out: a.map((x, i) => (o('pre') === 'dash' ? '- ' : o('pre') === 'num' ? (i + 1) + '. ' : '') + x).join('\n'), info: a.length + ' mục' }; } }) }));
D(meta({ slug: 'list-to-text', name: 'Gộp danh sách thành văn bản', cat: 'text', icon: '🧾', desc: 'Nối các dòng thành một chuỗi, thêm dấu ngăn cách và dấu nháy', pop: 44,
  kw: 'list to text join lines noi dong thanh chuoi gop danh sach comma separated sql in', related: ['text-to-list', 'xoa-dong-trung', 'sap-xep-a-sang-z'],
  render: transform({ sample: 'SP001\nSP002\nSP003\nSP004', opts: sel('d', 'Ngăn cách', [['comma', 'Dấu phẩy + cách (, )'], ['commanosp', 'Dấu phẩy (,)'], ['semi', 'Chấm phẩy (; )'], ['space', 'Khoảng trắng'], ['custom', 'Tự chọn']], 'comma') + txt('cus', 'Ngăn cách tự chọn', ' | ') +
    sel('q', 'Bọc mỗi mục', [['none', 'Không'], ['single', "Nháy đơn 'x'"], ['double', 'Nháy kép "x"']], 'none') + txt('wrap', 'Bọc cả chuỗi (ví dụ: ( ))', '', '( )') + chk('em', 'Bỏ dòng trống', true),
    fn: (s, o) => { let a = lines(s).map(x => x.trim()); if (o('em')) a = a.filter(x => x); const q = { none: '', single: "'", double: '"' }[o('q')];
      const d = { comma: ', ', commanosp: ',', semi: '; ', space: ' ', custom: o('cus') }[o('d')]; let r = a.map(x => q + x + q).join(d);
      const w = (o('wrap') || '').trim().split(/\s+/); if (w[0]) r = w[0] + r + (w[1] || ''); return { out: r, info: a.length + ' mục' }; } }) }));

/* ---------- text: CSV cleaner ---------- */
function parseCSV(s, d) { const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < s.length; i++) { const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true; else if (c === d) { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; } else cell += c; }
  if (cell || row.length) { row.push(cell); rows.push(row); } return rows; }
D(meta({ slug: 'csv-cleaner', name: 'Làm sạch CSV', cat: 'file', icon: '🧮', desc: 'Cắt khoảng trắng, bỏ dòng trống, bỏ dòng trùng và đổi dấu phân cách CSV', pop: 48, level: 2,
  kw: 'csv cleaner lam sach csv xoa dong trung csv doi dau phan cach excel du lieu', related: ['xoa-dong-trung', 'json-formatter', 'text-to-list'],
  render: transform({ mono: true, sample: 'Tên ; Số điện thoại ; Tỉnh\n Nguyễn An ; 0901234567 ; Hà Nội \n\nTrần Bình;0912345678;Đà Nẵng\n Nguyễn An ; 0901234567 ; Hà Nội ',
    opts: sel('ind', 'Dấu phân cách đầu vào', [['auto', 'Tự nhận diện'], [',', 'Dấu phẩy'], [';', 'Chấm phẩy'], ['\t', 'Tab']], 'auto') + sel('outd', 'Dấu phân cách đầu ra', [[',', 'Dấu phẩy'], [';', 'Chấm phẩy (Excel VN)'], ['\t', 'Tab']], ',') +
      chk('tr', 'Cắt khoảng trắng mỗi ô', true) + chk('em', 'Bỏ dòng trống', true) + chk('uq', 'Bỏ dòng trùng', true),
    fn: (s, o) => { let d = o('ind'); if (d === 'auto') { const first = s.split('\n')[0] || ''; d = [',', ';', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0]; }
      let rows = parseCSV(s, d); if (o('tr')) rows = rows.map(r => r.map(c => c.trim())); if (o('em')) rows = rows.filter(r => r.some(c => c !== ''));
      if (o('uq')) { const seen = new Set(); rows = rows.filter(r => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; }); }
      const od = o('outd'); const qq = c => /["\n\r]/.test(c) || c.includes(od) ? '"' + c.replace(/"/g, '""') + '"' : c;
      return { out: rows.map(r => r.map(qq).join(od)).join('\n'), info: rows.length + ' dòng · phân cách vào: ' + ({ ',': 'phẩy', ';': 'chấm phẩy', '\t': 'tab' }[d]) }; },
    after: (root, run, ctx) => { U.$(root, '#dl').textContent = 'Tải .csv'; U.$(root, '#dl').onclick = () => { const v = U.$(root, '#out').dataset.v; v ? ctx.download('du-lieu-sach.csv', '﻿' + v, 'text/csv;charset=utf-8') : ctx.toast('Chưa có kết quả'); }; } }) }));

/* ---------- developer: mã hóa vui ---------- */
const MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', '=': '-...-', '+': '.-.-.', '-': '-....-', '"': '.-..-.', '@': '.--.-.' };
const RMORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
const modeTabs = (a, b) => U.tabs('mode', [['enc', a], ['dec', b]], 'enc');
function twoWay(enc, dec, o) {
  return Object.assign({}, o, { extra: modeTabs(o.a || 'Mã hóa', o.b || 'Giải mã') + (o.extra || ''), fn: (s, opt, root) => { const m = U.$(root, '#mode .tab[aria-selected="true"]').dataset.v; return (m === 'enc' ? enc : dec)(s, opt, root); },
    after: (root, run) => { U.bindTabs(root, 'mode', () => { const out = U.$(root, '#out').dataset.v; if (out) U.$(root, '#in').value = out; run(); }); if (o.after) o.after(root, run); } });
}
D(meta({ slug: 'ma-morse', name: 'Mã Morse', cat: 'dev', icon: '📡', desc: 'Chuyển chữ sang mã Morse và giải mã Morse về chữ', pop: 45,
  kw: 'morse code encoder decoder ma morse tich te dich ma morse sos', h1: 'Dịch mã Morse online', aliases: ['morse-code-encoder', 'morse-code-decoder'], related: ['binary-encoder', 'rot13', 'caesar-cipher'],
  faq: [['Có dịch được tiếng Việt có dấu không?', 'Mã Morse quốc tế không có dấu tiếng Việt, nên chữ có dấu được bỏ dấu trước khi mã hóa: “Việt” → “viet”.']],
  render: transform(twoWay(s => U.noAccent(s).toLowerCase().split('\n').map(l => l.split(/\s+/).filter(Boolean).map(w => [...w].map(c => MORSE[c] || '').filter(Boolean).join(' ')).join(' / ')).join('\n'),
    s => s.split('\n').map(l => l.trim().split(/\s*\/\s*|\s{3,}/).map(w => w.split(/\s+/).map(c => RMORSE[c] || (c ? '?' : '')).join('')).join(' ')).join('\n'),
    { sample: 'SOS cuu toi voi', mono: true, a: 'Chữ → Morse', b: 'Morse → Chữ' })) }));
const utf8 = s => [...new TextEncoder().encode(s)];
const fromBytes = b => new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(b));
D(meta({ slug: 'binary-encoder', name: 'Chuyển văn bản ↔ nhị phân', cat: 'dev', icon: '0️⃣', desc: 'Đổi chữ (kể cả tiếng Việt) sang mã nhị phân 0 và 1, và ngược lại', pop: 43,
  kw: 'binary translator text to binary nhi phan ma 01 binary decoder chuyen chu sang so nhi phan', aliases: ['binary-decoder'], related: ['hex-encoder', 'ascii-converter', 'ma-hoa-base64'],
  render: transform(twoWay(s => utf8(s).map(b => b.toString(2).padStart(8, '0')).join(' '), s => fromBytes(s.replace(/[^01]/g, '').match(/.{1,8}/g).map(x => parseInt(x, 2))),
    { sample: 'Xin chào', mono: true, a: 'Chữ → Nhị phân', b: 'Nhị phân → Chữ' })) }));
D(meta({ slug: 'hex-encoder', name: 'Chuyển văn bản ↔ Hex', cat: 'dev', icon: '🔢', desc: 'Đổi chữ sang mã thập lục phân (UTF-8) và giải mã Hex về chữ', pop: 41,
  kw: 'hex encoder decoder text to hex thap luc phan ma hex utf8', aliases: ['hex-decoder'], related: ['binary-encoder', 'ascii-converter', 'ma-hoa-base64'],
  render: transform(twoWay((s, o) => utf8(s).map(b => b.toString(16).padStart(2, '0')).map(x => o('up') ? x.toUpperCase() : x).join(o('spc') ? ' ' : ''), s => fromBytes((s.replace(/0x/gi, '').replace(/[^0-9a-f]/gi, '').match(/.{1,2}/g) || []).map(x => parseInt(x, 16))),
    { sample: 'Tiện ích', mono: true, a: 'Chữ → Hex', b: 'Hex → Chữ', opts: chk('spc', 'Cách mỗi byte', true) + chk('up', 'Chữ hoa (A–F)', false) })) }));
D(meta({ slug: 'ascii-converter', name: 'Chuyển đổi mã ASCII / Unicode', cat: 'dev', icon: '🔠', desc: 'Đổi ký tự sang mã số (ASCII, Unicode) và ngược lại', pop: 39,
  kw: 'ascii converter unicode code point ma ascii ky tu sang so char code', related: ['hex-encoder', 'binary-encoder', 'html-encode'],
  render: transform(twoWay((s, o) => [...s].map(c => { const n = c.codePointAt(0); return o('fmt') === 'u' ? 'U+' + n.toString(16).toUpperCase().padStart(4, '0') : String(n); }).join(' '),
    s => s.trim().split(/[\s,]+/).filter(Boolean).map(x => String.fromCodePoint(/^u\+/i.test(x) ? parseInt(x.slice(2), 16) : parseInt(x, 10))).join(''),
    { sample: 'Hello Việt', mono: true, a: 'Ký tự → Mã', b: 'Mã → Ký tự', opts: sel('fmt', 'Định dạng mã', [['d', 'Thập phân (72 101…)'], ['u', 'Unicode (U+0048)']], 'd') })) }));
const shiftChar = (c, k) => { const code = c.charCodeAt(0); if (code >= 65 && code <= 90) return String.fromCharCode((code - 65 + k + 26 * 10) % 26 + 65); if (code >= 97 && code <= 122) return String.fromCharCode((code - 97 + k + 26 * 10) % 26 + 97); return c; };
D(meta({ slug: 'rot13', name: 'ROT13', cat: 'dev', icon: '🔄', desc: 'Mã hóa ROT13: dịch mỗi chữ cái 13 vị trí, làm lại lần nữa để giải mã', pop: 32,
  kw: 'rot13 ma hoa rot 13 cipher xoay chu cai', related: ['caesar-cipher', 'ma-morse', 'binary-encoder'],
  render: transform({ sample: 'Hello, chuc ban mot ngay vui ve!', mono: true, fn: s => [...s].map(c => shiftChar(c, 13)).join('') }) }));
D(meta({ slug: 'caesar-cipher', name: 'Mật mã Caesar', cat: 'dev', icon: '🏛️', desc: 'Mã hóa và giải mã Caesar với số bước dịch tùy chọn, kèm bảng thử mọi khóa', pop: 36,
  kw: 'caesar cipher mat ma caesar ma hoa dich chu giai ma brute force', related: ['rot13', 'ma-morse', 'tao-mat-khau'],
  render: transform(twoWay((s, o) => [...s].map(c => shiftChar(c, +o('k'))).join(''), (s, o) => o('all') ? Array.from({ length: 25 }, (_, i) => 'Khóa ' + String(i + 1).padStart(2, ' ') + ': ' + [...s].map(c => shiftChar(c, -(i + 1))).join('')).join('\n') : [...s].map(c => shiftChar(c, -o('k'))).join(''),
    { sample: 'Hen gap ban luc 7 gio', mono: true, opts: '<div class="field"><label class="label" for="k">Số bước dịch (khóa)</label><input class="range" type="range" id="k" min="1" max="25" value="3"></div>' + chk('all', 'Giải mã: thử cả 25 khóa', false),
      after: (root, run) => { const k = U.$(root, '#k'), lab = U.$(root, 'label[for="k"]'); const upd = () => { lab.textContent = 'Số bước dịch (khóa): ' + k.value; }; k.addEventListener('input', upd); upd(); } })) }));

/* ---------- internet / developer: URL & HTML ---------- */
D(meta({ slug: 'url-encoder', name: 'URL Encode / Decode', cat: 'internet', icon: '🌐', desc: 'Mã hóa và giải mã URL (percent-encoding), hỗ trợ tiếng Việt', pop: 56,
  kw: 'url encode decode ma hoa url percent encoding encodeuricomponent giai ma link tieng viet', h1: 'Mã hóa / giải mã URL', aliases: ['url-decoder'], related: ['slug-generator', 'ma-hoa-base64', 'html-encode', 'utm-builder'],
  faq: [['Khi nào cần mã hóa URL?', 'Khi đường dẫn hoặc tham số có dấu tiếng Việt, khoảng trắng hay ký tự đặc biệt như &, ?, =.']],
  render: transform(twoWay((s, o) => o('full') ? encodeURI(s) : s.split('\n').map(encodeURIComponent).join('\n'), (s, o) => s.split('\n').map(l => decodeURIComponent(o('plus') ? l.replace(/\+/g, ' ') : l)).join('\n'),
    { sample: 'https://tienichnhanh.vn/tim kiếm?q=tính phần trăm&loại=máy tính', mono: true, opts: chk('full', 'Giữ cấu trúc URL (encodeURI)', true) + chk('plus', 'Giải mã dấu + thành khoảng trắng', true) })) }));
const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
D(meta({ slug: 'html-encode', name: 'HTML Encode / Decode', cat: 'dev', icon: '🏷️', desc: 'Chuyển ký tự đặc biệt thành thực thể HTML (&lt; &amp;…) và ngược lại', pop: 40,
  kw: 'html encode decode html entities escape unescape ky tu dac biet ma hoa html', aliases: ['html-decode'], related: ['url-encoder', 'json-formatter', 'ma-hoa-base64'],
  render: transform(twoWay((s, o) => { let r = s.replace(/[&<>"']/g, c => ENT[c]); if (o('nonascii')) r = [...r].map(c => c.codePointAt(0) > 127 ? '&#' + c.codePointAt(0) + ';' : c).join(''); return r; },
    s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; },
    { sample: '<a href="/tools?q=1&lang=vi">Tiện ích & công cụ</a>', mono: true, opts: chk('nonascii', 'Mã hóa cả ký tự có dấu (&#7879;…)', false) })) }));
})();
