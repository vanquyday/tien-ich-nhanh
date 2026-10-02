/* Modules: tools/text/*, tools/calculator/*, tools/finance/*, tools/convert/*, tools/vn/* */
(function () {
const TI = window.TI, U = TI.ui, D = TI.define, esc = TI.esc, fmt = TI.fmt, money = TI.money;

/* ---------- text/counter (dùng chung cho Đếm ký tự, Đếm từ) ---------- */
function countStats(s) {
  const trimmed = s.trim();
  return {
    chars: [...s].length,
    noSpace: [...s.replace(/\s/g, '')].length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: s ? s.split(/\r?\n/).length : 0,
    sentences: trimmed ? (trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || []).filter(x => x.trim()).length : 0,
    paras: trimmed ? trimmed.split(/\n\s*\n/).filter(x => x.trim()).length : 0
  };
}
function counter(primary) {
  return (root, ctx) => {
    const order = primary === 'words' ? ['words', 'chars', 'lines', 'noSpace', 'sentences', 'paras'] : ['chars', 'words', 'lines', 'noSpace', 'sentences', 'paras'];
    const label = { chars: 'Ký tự', words: 'Từ', lines: 'Dòng', noSpace: 'Ký tự không khoảng trắng', sentences: 'Câu', paras: 'Đoạn' };
    root.innerHTML = U.textArea('txt', 'Dán hoặc nhập văn bản vào đây…') +
      '<div class="stat-grid">' + order.map((k, i) => '<div class="stat"' + (i === 0 ? ' style="background:var(--primary-soft)"' : '') + '><div class="stat-label">' + label[k] + '</div><div class="stat-value" data-k="' + k + '">0</div></div>').join('') + '</div>' +
      '<div class="spread"><span class="t-small muted" id="read">Thời gian đọc: 0 phút</span><div class="btn-row"><button class="btn" type="button" id="clr">Xóa</button><button class="btn" type="button" id="cp">Sao chép</button><button class="btn" type="button" id="dl">Tải xuống .txt</button></div></div>';
    const ta = U.$(root, '#txt');
    ta.value = ctx.state('') || '';
    const draw = () => {
      const st = countStats(ta.value);
      U.$$(root, '[data-k]').forEach(el => el.textContent = fmt(st[el.dataset.k], 0));
      const m = st.words / 200; U.$(root, '#read').textContent = 'Thời gian đọc ≈ ' + (m < 1 ? Math.ceil(m * 60) + ' giây' : fmt(m, 1) + ' phút') + ' (200 từ/phút)';
      ctx.save(ta.value.slice(0, 20000));
    };
    ta.addEventListener('input', draw);
    U.$(root, '#clr').onclick = () => { ta.value = ''; draw(); ta.focus(); };
    U.$(root, '#cp').onclick = () => ta.value ? ctx.copy(ta.value) : ctx.toast('Chưa có văn bản');
    U.$(root, '#dl').onclick = () => ctx.download('van-ban.txt', ta.value);
    draw();
  };
}
const faqCount = [['Đếm ký tự có tính khoảng trắng không?', 'Có hai số liệu: “Ký tự” tính cả khoảng trắng và xuống dòng, “Ký tự không khoảng trắng” bỏ hết khoảng trắng.'],
  ['Chữ có dấu tiếng Việt được tính thế nào?', 'Mỗi chữ cái có dấu (ví dụ “ệ”) được tính là 1 ký tự, đúng như khi bạn nhìn thấy.'],
  ['Văn bản có bị gửi đi đâu không?', 'Không. Mọi phép đếm chạy trên trình duyệt của bạn, kể cả khi mất mạng.']];
D({ slug: 'dem-ky-tu', name: 'Đếm ký tự', cat: 'text', icon: '🔤', desc: 'Đếm số ký tự, số từ và số dòng trong văn bản', pop: 98,
  kw: 'character counter char count dem chu dem ky tu khong khoang trang letter count', h1: 'Đếm ký tự online',
  seoTitle: 'Đếm Ký Tự Online – Đếm Chữ, Từ, Dòng Miễn Phí', seoDesc: 'Đếm số ký tự, số từ và số dòng trong văn bản miễn phí. Hỗ trợ tiếng Việt có dấu, xử lý ngay trên trình duyệt.',
  aliases: ['dem-ky-tu-khong-khoang-trang', 'dem-dong', 'dem-cau', 'dem-doan', 'character-counter', 'character-count', 'line-counter', 'social-character-counter'],
  related: ['dem-tu', 'doi-chu-hoa-thuong', 'xoa-khoang-trang', 'meta-title-counter', 'kiem-tra-toc-do-go-phim'], faq: faqCount,
  how: ['Dán hoặc gõ văn bản vào ô.', 'Số ký tự, từ, dòng cập nhật ngay khi bạn gõ.', 'Bấm Sao chép hoặc Tải xuống nếu cần lưu văn bản.'], render: counter('chars') });
D({ slug: 'dem-tu', name: 'Đếm từ', cat: 'text', icon: '📝', desc: 'Đếm số từ, câu, đoạn và ước tính thời gian đọc', pop: 90,
  kw: 'word counter word count dem so tu dem chu bai viet tieu luan', h1: 'Đếm từ online', seoTitle: 'Đếm Từ Online – Word Counter Tiếng Việt Miễn Phí',
  aliases: ['word-counter', 'word-count'], related: ['dem-ky-tu', 'doi-chu-hoa-thuong', 'xoa-khoang-trang', 'keyword-density-checker'], faq: faqCount, render: counter('words') });

/* ---------- text/case-converter ---------- */
D({ slug: 'doi-chu-hoa-thuong', name: 'Đổi chữ HOA / thường', cat: 'text', icon: '🔠', desc: 'Chuyển chữ thường → CHỮ HOA, viết hoa chữ cái đầu, bỏ dấu', pop: 96,
  kw: 'uppercase lowercase case converter chu hoa chu thuong in hoa viet hoa title case sentence case bo dau tieng viet capitalize', h1: 'Đổi chữ hoa, chữ thường online',
  seoTitle: 'Chuyển Chữ Thường Sang CHỮ HOA Online – Đổi Kiểu Chữ Miễn Phí',
  aliases: ['chuyen-chu-thuong-sang-chu-hoa', 'chuyen-chu-hoa-sang-chu-thuong', 'viet-hoa-chu-cai-dau', 'viet-hoa-dau-cau', 'case-converter', 'dao-nguoc-van-ban'],
  related: ['dem-ky-tu', 'xoa-khoang-trang', 'slug-generator', 'fancy-text-generator'],
  faq: [['Có giữ nguyên dấu tiếng Việt khi chuyển chữ hoa không?', 'Có. “tiếng việt” sẽ thành “TIẾNG VIỆT”, đúng dấu.'], ['“Bỏ dấu” dùng khi nào?', 'Khi cần tên file, tên đăng nhập hoặc slug không dấu: “Hà Nội” → “Ha Noi”.']],
  render(root, ctx) {
    const modes = [['up', 'CHỮ HOA'], ['low', 'chữ thường'], ['title', 'Viết Hoa Mỗi Từ'], ['sent', 'Viết hoa đầu câu'], ['toggle', 'đẢO hOA tHƯỜNG'], ['noacc', 'Bỏ dấu'], ['rev', 'Đảo ngược']];
    root.innerHTML = U.textArea('txt', 'Nhập văn bản cần đổi kiểu chữ…') +
      '<div class="btn-row" id="modes">' + modes.map(([v, t]) => '<button class="btn" type="button" data-m="' + v + '">' + t + '</button>').join('') + '</div>' +
      '<div class="spread"><span class="t-small muted" id="cnt">0 ký tự</span><div class="btn-row"><button class="btn" type="button" id="clr">Xóa</button><button class="btn btn-primary" type="button" id="cp">Sao chép kết quả</button><button class="btn" type="button" id="dl">Tải xuống</button></div></div>';
    const ta = U.$(root, '#txt');
    const f = {
      up: s => s.toLocaleUpperCase('vi'), low: s => s.toLocaleLowerCase('vi'),
      title: s => s.toLocaleLowerCase('vi').replace(/(^|[\s\-("“'])(\S)/gu, (m, a, b) => a + b.toLocaleUpperCase('vi')),
      sent: s => s.toLocaleLowerCase('vi').replace(/(^\s*|[.!?…]\s+|\n\s*)(\S)/gu, (m, a, b) => a + b.toLocaleUpperCase('vi')),
      toggle: s => [...s].map(c => c === c.toLocaleUpperCase('vi') ? c.toLocaleLowerCase('vi') : c.toLocaleUpperCase('vi')).join(''),
      noacc: U.noAccent, rev: s => [...s].reverse().join('')
    };
    U.$(root, '#modes').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; if (!ta.value) { ctx.toast('Nhập văn bản trước'); ta.focus(); return; } ta.value = f[b.dataset.m](ta.value); ta.dispatchEvent(new Event('input')); });
    ta.addEventListener('input', () => U.$(root, '#cnt').textContent = fmt([...ta.value].length, 0) + ' ký tự');
    U.$(root, '#clr').onclick = () => { ta.value = ''; ta.dispatchEvent(new Event('input')); };
    U.$(root, '#cp').onclick = () => ta.value ? ctx.copy(ta.value) : ctx.toast('Chưa có văn bản');
    U.$(root, '#dl').onclick = () => ctx.download('van-ban.txt', ta.value);
  } });

/* ---------- text/whitespace ---------- */
D({ slug: 'xoa-khoang-trang', name: 'Xóa khoảng trắng thừa', cat: 'text', icon: '🧹', desc: 'Xóa khoảng trắng thừa, dòng trống và ký tự tab trong văn bản', pop: 80,
  kw: 'remove spaces whitespace cleaner trim xoa dau cach xoa dong trong lam sach van ban', h1: 'Xóa khoảng trắng thừa online',
  aliases: ['xoa-khoang-trang-thua', 'whitespace-cleaner', 'xoa-dong-trong'], related: ['dem-ky-tu', 'doi-chu-hoa-thuong', 'xoa-dong-trung', 'tim-va-thay-the'],
  render(root, ctx) {
    const opts = [['multi', 'Gộp nhiều khoảng trắng thành một', true], ['trim', 'Cắt khoảng trắng đầu/cuối mỗi dòng', true], ['blank', 'Xóa dòng trống', true], ['tabs', 'Đổi tab thành khoảng trắng', true], ['all', 'Xóa toàn bộ khoảng trắng', false], ['join', 'Nối tất cả thành một dòng', false]];
    root.innerHTML = '<div class="split"><div class="stack">' + U.textArea('txt', 'Dán văn bản cần làm sạch…') + '</div><div class="stack"><div class="out-box" id="out" aria-live="polite"></div></div></div>' +
      '<div class="form-grid">' + opts.map(([k, t, on]) => '<label class="check"><input type="checkbox" id="o-' + k + '"' + (on ? ' checked' : '') + '>' + t + '</label>').join('') + '</div>' +
      '<div class="spread"><span class="t-small muted" id="info"></span><div class="btn-row"><button class="btn" type="button" id="clr">Xóa</button><button class="btn btn-primary" type="button" id="cp">Sao chép kết quả</button></div></div>';
    const ta = U.$(root, '#txt'), out = U.$(root, '#out');
    ta.value = 'Đây   là    văn bản   có\tnhiều  khoảng trắng.   \n\n\n   Dòng thứ hai   bị thụt lề.  ';
    const on = k => U.$(root, '#o-' + k).checked;
    const run = () => {
      let s = ta.value;
      if (on('tabs')) s = s.replace(/\t/g, ' ');
      if (on('multi')) s = s.replace(/[  ]{2,}/g, ' ');
      if (on('trim')) s = s.split('\n').map(l => l.trim()).join('\n');
      if (on('blank')) s = s.split('\n').filter(l => l.trim()).join('\n');
      if (on('join')) s = s.replace(/\s*\n\s*/g, ' ');
      if (on('all')) s = s.replace(/\s+/g, '');
      out.textContent = s; out.dataset.v = s;
      U.$(root, '#info').textContent = 'Đã bỏ ' + fmt(ta.value.length - s.length, 0) + ' ký tự';
    };
    root.addEventListener('input', run); root.addEventListener('change', run);
    U.$(root, '#clr').onclick = () => { ta.value = ''; run(); };
    U.$(root, '#cp').onclick = () => out.dataset.v ? ctx.copy(out.dataset.v) : ctx.toast('Chưa có kết quả');
    run();
  } });

/* ---------- calculator/percentage ---------- */
D({ slug: 'tinh-phan-tram', name: 'Tính phần trăm', cat: 'calc', icon: '％', desc: 'Tính X% của Y, tỷ lệ phần trăm và % tăng giảm', pop: 97,
  kw: 'percentage calculator percent phan tram ti le % tang giam tinh %', h1: 'Tính phần trăm online',
  seoTitle: 'Tính Phần Trăm Online – Công Cụ Tính % Miễn Phí', seoDesc: 'Tính X% của một số, X là bao nhiêu phần trăm của Y, phần trăm tăng giảm. Có công thức và giải thích từng bước.',
  aliases: ['tinh-phan-tram-tang-giam', 'tinh-chenh-lech-phan-tram', 'tinh-ty-le'], related: ['tinh-chiet-khau', 'tinh-vat', 'tinh-loi-nhuan', 'tinh-roi', 'tinh-roas'],
  faq: [['Công thức tính phần trăm là gì?', 'X% của Y = Y × X / 100. Ví dụ 20% của 500 = 500 × 20 / 100 = 100.'], ['Tính phần trăm tăng giảm thế nào?', '% thay đổi = (Giá trị mới − Giá trị cũ) / Giá trị cũ × 100.'], ['Nhập số thập phân thế nào?', 'Dùng dấu phẩy hoặc dấu chấm đều được: 12,5 hoặc 12.5.']],
  how: ['Chọn kiểu phép tính phù hợp.', 'Nhập các giá trị, kết quả hiện ngay.', 'Bấm Sao chép để dùng kết quả.'],
  render(root, ctx) {
    const modes = {
      of: { f: [['a', 'Phần trăm', '%', '20'], ['b', 'Của giá trị', '', '500']], c: v => ({ value: fmt(v.b * v.a / 100, 4), formula: v.a + '% của ' + fmt(v.b, 4) + ' = ' + fmt(v.b, 4) + ' × ' + fmt(v.a, 4) + ' / 100 = ' + fmt(v.b * v.a / 100, 4) }) },
      is: { f: [['a', 'Giá trị', '', '50'], ['b', 'Là bao nhiêu % của', '', '200']], c: v => v.b ? ({ value: fmt(v.a / v.b * 100, 4) + '%', formula: fmt(v.a, 4) + ' / ' + fmt(v.b, 4) + ' × 100 = ' + fmt(v.a / v.b * 100, 4) + '%' }) : null },
      chg: { f: [['a', 'Giá trị cũ', '', '80'], ['b', 'Giá trị mới', '', '100']], c: v => { if (!v.a) return null; const p = (v.b - v.a) / Math.abs(v.a) * 100; return { value: (p > 0 ? '+' : '') + fmt(p, 2) + '%', formula: '(' + fmt(v.b, 4) + ' − ' + fmt(v.a, 4) + ') / ' + fmt(v.a, 4) + ' × 100 = ' + fmt(p, 2) + '%', note: p >= 0 ? 'Tăng ' + fmt(v.b - v.a, 4) : 'Giảm ' + fmt(v.a - v.b, 4) }; } },
      add: { f: [['a', 'Giá trị', '', '500'], ['b', 'Tăng (+) hoặc giảm (−)', '%', '15']], c: v => ({ value: fmt(v.a * (1 + v.b / 100), 4), formula: fmt(v.a, 4) + ' × (1 ' + (v.b >= 0 ? '+ ' : '− ') + fmt(Math.abs(v.b), 4) + '/100) = ' + fmt(v.a * (1 + v.b / 100), 4) }) }
    };
    let mode = 'of';
    root.innerHTML = U.tabs('mode', [['of', 'X% của Y'], ['is', 'X là ?% của Y'], ['chg', '% tăng / giảm'], ['add', 'Cộng / trừ %']], mode) + '<div id="body" class="stack"></div>';
    const body = U.$(root, '#body');
    const draw = () => {
      const m = modes[mode];
      U.calc(body, ctx, { fields: m.f.map(([id, label, unit, value]) => ({ id, label, unit, value })), compute: v => (isNaN(v.a) || isNaN(v.b)) ? null : m.c(v) });
    };
    U.bindTabs(root, 'mode', v => { mode = v; body.replaceWith(body.cloneNode(false)); draw2(); });
    function draw2() { const b = U.$(root, '#body'); const m = modes[mode]; U.calc(b, ctx, { fields: m.f.map(([id, label, unit, value]) => ({ id, label, unit, value })), compute: v => (isNaN(v.a) || isNaN(v.b)) ? null : m.c(v) }); }
    draw();
  } });

/* ---------- finance/discount ---------- */
D({ slug: 'tinh-chiet-khau', name: 'Tính chiết khấu', cat: 'finance', icon: '🏷️', desc: 'Tính giá sau giảm, số tiền tiết kiệm, giảm giá nhiều tầng', pop: 82,
  kw: 'discount calculator giam gia sale off chiet khau khuyen mai gia sau giam', aliases: ['discount-calculator', 'tinh-phan-tram-giam-gia', 'tinh-gia-truoc-giam'],
  related: ['tinh-phan-tram', 'tinh-vat', 'tinh-loi-nhuan', 'tinh-voucher'],
  render(root, ctx) {
    U.calc(root, ctx, { label: 'Giá sau chiết khấu', fields: [{ id: 'p', label: 'Giá gốc', unit: '₫', value: '1.290.000' }, { id: 'd', label: 'Chiết khấu', unit: '%', value: '20' }, { id: 'd2', label: 'Giảm thêm (nếu có)', unit: '%', value: '0', hint: 'Giảm tiếp trên giá đã giảm' }],
      compute: v => { if (isNaN(v.p) || isNaN(v.d)) return null; const d2 = isNaN(v.d2) ? 0 : v.d2; const f = v.p * (1 - v.d / 100) * (1 - d2 / 100); const eff = (1 - f / v.p) * 100;
        return { value: money(f), copy: Math.round(f), formula: fmt(v.p, 0) + ' × (1 − ' + fmt(v.d, 2) + '%)' + (d2 ? ' × (1 − ' + fmt(d2, 2) + '%)' : '') + ' = ' + fmt(f, 0), note: 'Bạn tiết kiệm <b>' + money(v.p - f) + '</b> · Giảm thực tế ' + fmt(eff, 2) + '%' }; } });
  } });

/* ---------- finance/vat ---------- */
D({ slug: 'tinh-vat', name: 'Tính VAT', cat: 'finance', icon: '🧾', desc: 'Cộng VAT vào giá hoặc tách VAT từ giá đã có thuế', pop: 92,
  kw: 'vat thue gia tri gia tang tax calculator tach vat cong vat 8% 10% hoa don', h1: 'Tính thuế VAT online', seoTitle: 'Tính VAT Online – Tách Thuế, Cộng Thuế GTGT 8%, 10%',
  related: ['tinh-phan-tram', 'tinh-chiet-khau', 'tinh-loi-nhuan', 'tinh-luong-gross-net'],
  faq: [['Tách VAT từ giá đã có thuế thế nào?', 'Giá chưa thuế = Giá có thuế / (1 + thuế suất). Ví dụ 1.080.000 / 1,08 = 1.000.000.'], ['Thuế suất nào đang áp dụng?', 'Phổ biến là 10%, một số hàng hóa dịch vụ được giảm còn 8% hoặc 5%. Hãy kiểm tra quy định hiện hành cho mặt hàng của bạn.']],
  render(root, ctx) {
    let mode = 'add', rate = 10;
    root.innerHTML = U.tabs('mode', [['add', 'Chưa VAT → Có VAT'], ['split', 'Có VAT → Tách VAT']], mode) +
      '<div class="field"><span class="label">Thuế suất</span>' + U.chips('rate', [[0, '0%'], [5, '5%'], [8, '8%'], [10, '10%']], rate) + '</div><div id="b" class="stack"></div>';
    const draw = () => {
      const b = U.$(root, '#b'); const nb = b.cloneNode(false); b.replaceWith(nb);
      U.calc(nb, ctx, { label: mode === 'add' ? 'Tổng thanh toán (gồm VAT)' : 'Giá chưa VAT', fields: [{ id: 'a', label: mode === 'add' ? 'Giá chưa VAT' : 'Giá đã gồm VAT', unit: '₫', value: '1.000.000' }],
        compute: v => { if (isNaN(v.a)) return null; const r = rate / 100;
          if (mode === 'add') { const t = v.a * r; return { value: money(v.a + t), copy: Math.round(v.a + t), formula: fmt(v.a, 0) + ' × ' + (1 + r).toFixed(2).replace('.', ',') + ' = ' + fmt(v.a + t, 0), note: 'Tiền thuế VAT ' + rate + '%: <b>' + money(t) + '</b>' }; }
          const pre = v.a / (1 + r); return { value: money(pre), copy: Math.round(pre), formula: fmt(v.a, 0) + ' / ' + (1 + r).toFixed(2).replace('.', ',') + ' = ' + fmt(pre, 0), note: 'Tiền thuế VAT ' + rate + '%: <b>' + money(v.a - pre) + '</b>' }; } });
    };
    U.bindTabs(root, 'mode', v => { mode = v; draw(); });
    U.bindChips(root, 'rate', v => { rate = +v; draw(); });
    draw();
  } });

/* ---------- datetime/age ---------- */
function diffYMD(a, b) {
  let y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}
D({ slug: 'tinh-tuoi', name: 'Tính tuổi', cat: 'datetime', icon: '🎂', desc: 'Tính tuổi chính xác theo năm, tháng, ngày và ngày sinh nhật tới', pop: 93,
  kw: 'age calculator tinh tuoi bao nhieu tuoi ngay sinh sinh nhat tuoi chinh xac', h1: 'Tính tuổi online', aliases: ['tinh-tuoi-theo-ngay'],
  related: ['tinh-ngay', 'dem-nguoc', 'tinh-tuoi-mu', 'thu-cua-ngay-bat-ky'],
  render(root, ctx) {
    const today = new Date();
    root.innerHTML = '<div class="form-grid"><div class="field"><label class="label" for="dob">Ngày sinh</label><input class="input" type="date" id="dob" value="1995-08-15" max="' + U.dateInput(today) + '"></div>' +
      '<div class="field"><label class="label" for="at">Tính đến ngày</label><input class="input" type="date" id="at" value="' + U.dateInput(today) + '"></div></div>' + U.result('res', 'Tuổi của bạn') + '<div class="stat-grid" id="st"></div>';
    const run = () => {
      const a = U.parseDate(U.$(root, '#dob').value), b = U.parseDate(U.$(root, '#at').value);
      if (!a || !b || a > b) { U.setResult(root, 'res', { value: '—', formula: 'Chọn ngày sinh trước ngày tính tuổi' }); U.$(root, '#st').innerHTML = ''; return; }
      const r = diffYMD(a, b), days = Math.round((b - a) / 864e5);
      let nb = new Date(b.getFullYear(), a.getMonth(), a.getDate()); if (nb < b) nb = new Date(b.getFullYear() + 1, a.getMonth(), a.getDate());
      const left = Math.round((nb - b) / 864e5);
      U.setResult(root, 'res', { value: r.y + ' tuổi', formula: r.y + ' năm ' + r.m + ' tháng ' + r.d + ' ngày', note: 'Sinh vào ' + U.vnDate(a), copy: r.y + ' năm ' + r.m + ' tháng ' + r.d + ' ngày' });
      U.$(root, '#st').innerHTML = [['Tổng số ngày', fmt(days, 0)], ['Tổng số tuần', fmt(Math.floor(days / 7), 0)], ['Tổng số tháng', fmt(r.y * 12 + r.m, 0)], ['Tổng số giờ', fmt(days * 24, 0)], ['Sinh nhật tới', left === 0 ? 'Hôm nay 🎉' : 'còn ' + left + ' ngày']]
        .map(([l, v]) => '<div class="stat"><div class="stat-label">' + l + '</div><div class="stat-value" style="font-size:20px">' + v + '</div></div>').join('');
    };
    root.addEventListener('input', run); U.bindCopy(root, ctx); run();
  } });

/* ---------- datetime/days ---------- */
D({ slug: 'tinh-ngay', name: 'Tính ngày', cat: 'datetime', icon: '📆', desc: 'Đếm số ngày giữa hai mốc, cộng trừ ngày, đếm ngày làm việc', pop: 78,
  kw: 'date calculator tinh so ngay giua 2 ngay cong tru ngay ngay lam viec days between dem ngay', h1: 'Tính số ngày giữa hai ngày',
  aliases: ['tinh-ngay-giua-2-moc', 'tinh-ngay-sau-x-ngay', 'tinh-ngay-truoc-x-ngay', 'dem-nguoc-ngay'], related: ['tinh-tuoi', 'dem-nguoc', 'dem-ngay-den-tet', 'ngay-thu-bao-nhieu-trong-nam'],
  render(root, ctx) {
    const t = new Date(), t2 = new Date(t.getFullYear(), 11, 31);
    root.innerHTML = U.tabs('mode', [['between', 'Khoảng cách 2 ngày'], ['add', 'Cộng / trừ ngày']], 'between') + '<div id="b" class="stack"></div>';
    const between = () => '<div class="form-grid"><div class="field"><label class="label" for="d1">Từ ngày</label><input class="input" type="date" id="d1" value="' + U.dateInput(t) + '"></div><div class="field"><label class="label" for="d2">Đến ngày</label><input class="input" type="date" id="d2" value="' + U.dateInput(t2) + '"></div></div>' +
      '<label class="check"><input type="checkbox" id="inc">Tính cả ngày kết thúc</label>' + U.result('res', 'Số ngày') + '<div class="stat-grid" id="st"></div>';
    const add = () => '<div class="form-grid"><div class="field"><label class="label" for="d1">Ngày bắt đầu</label><input class="input" type="date" id="d1" value="' + U.dateInput(t) + '"></div>' + U.num('n', 'Số ngày (+ cộng, − trừ)', { value: '100', mode: 'numeric' }) + '</div>' +
      '<label class="check"><input type="checkbox" id="work">Chỉ tính ngày làm việc (T2–T6)</label>' + U.result('res', 'Kết quả');
    let mode = 'between';
    const run = () => {
      const d1 = U.parseDate(U.$(root, '#d1').value);
      if (mode === 'between') {
        const d2 = U.parseDate(U.$(root, '#d2').value); if (!d1 || !d2) return;
        const inc = U.$(root, '#inc').checked ? 1 : 0; const sign = d2 >= d1 ? 1 : -1;
        const days = Math.round((d2 - d1) / 864e5) + inc * sign;
        let work = 0; const s = d1 < d2 ? d1 : d2, e = d1 < d2 ? d2 : d1;
        for (let d = new Date(s); d < e || (inc && +d === +e); d.setDate(d.getDate() + 1)) { const w = d.getDay(); if (w && w < 6) work++; if (work > 40000) break; }
        const r = diffYMD(s, e);
        U.setResult(root, 'res', { value: fmt(days, 0) + ' ngày', formula: U.vnDate(d1) + ' → ' + U.vnDate(d2), note: '', copy: days });
        U.$(root, '#st').innerHTML = [['Tuần + ngày', Math.floor(Math.abs(days) / 7) + ' tuần ' + (Math.abs(days) % 7) + ' ngày'], ['Năm / tháng / ngày', r.y + 'n ' + r.m + 't ' + r.d + 'ng'], ['Ngày làm việc', fmt(work, 0)], ['Số giờ', fmt(Math.abs(days) * 24, 0)]]
          .map(([l, v]) => '<div class="stat"><div class="stat-label">' + l + '</div><div class="stat-value" style="font-size:20px">' + v + '</div></div>').join('');
      } else {
        const n = U.val(root, 'n'); if (!d1 || isNaN(n)) return;
        const d = new Date(d1);
        if (U.$(root, '#work').checked) { let left = Math.abs(n), st = n >= 0 ? 1 : -1; while (left > 0) { d.setDate(d.getDate() + st); const w = d.getDay(); if (w && w < 6) left--; } }
        else d.setDate(d.getDate() + n);
        U.setResult(root, 'res', { value: d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(), formula: U.vnDate(d1) + (n >= 0 ? ' + ' : ' − ') + fmt(Math.abs(n), 0) + ' ngày', note: U.vnDate(d) });
      }
    };
    const draw = () => { const b = U.$(root, '#b'); b.innerHTML = mode === 'between' ? between() : add(); run(); };
    U.bindTabs(root, 'mode', v => { mode = v; draw(); });
    root.addEventListener('input', run); root.addEventListener('change', run); U.bindCopy(root, ctx); draw();
  } });

/* ---------- convert/units ---------- */
const UNITS = {
  length: ['Độ dài', { m: ['Mét (m)', 1], km: ['Kilômét (km)', 1000], cm: ['Xentimét (cm)', 0.01], mm: ['Milimét (mm)', 0.001], in: ['Inch (in)', 0.0254], ft: ['Feet (ft)', 0.3048], yd: ['Yard (yd)', 0.9144], mi: ['Dặm (mile)', 1609.344], nmi: ['Hải lý', 1852] }, 'm', 'cm'],
  weight: ['Khối lượng', { kg: ['Kilôgam (kg)', 1], g: ['Gam (g)', 0.001], mg: ['Miligam (mg)', 1e-6], t: ['Tấn (t)', 1000], ta: ['Tạ', 100], yen: ['Yến', 10], lb: ['Pound (lb)', 0.45359237], oz: ['Ounce (oz)', 0.028349523125], lang: ['Lạng (100 g)', 0.1] }, 'kg', 'lb'],
  temp: ['Nhiệt độ', { c: ['Độ C (°C)'], f: ['Độ F (°F)'], k: ['Kelvin (K)'] }, 'c', 'f'],
  area: ['Diện tích', { m2: ['Mét vuông (m²)', 1], km2: ['Km vuông (km²)', 1e6], ha: ['Héc-ta (ha)', 1e4], sao: ['Sào Bắc Bộ (360 m²)', 360], cm2: ['Cm vuông (cm²)', 1e-4], ft2: ['Feet vuông (ft²)', 0.09290304], acre: ['Mẫu Anh (acre)', 4046.8564224] }, 'm2', 'ft2'],
  volume: ['Thể tích', { l: ['Lít (l)', 1], ml: ['Mililít (ml)', 0.001], m3: ['Mét khối (m³)', 1000], gal: ['Gallon Mỹ', 3.785411784], cup: ['Cốc (cup Mỹ)', 0.2365882365], floz: ['Fl oz Mỹ', 0.0295735295625] }, 'l', 'gal'],
  speed: ['Tốc độ', { kmh: ['km/h', 1 / 3.6], ms: ['m/s', 1], mph: ['mph', 0.44704], kn: ['Hải lý/giờ (knot)', 0.514444] }, 'kmh', 'mph'],
  time: ['Thời gian', { s: ['Giây', 1], min: ['Phút', 60], h: ['Giờ', 3600], d: ['Ngày', 86400], w: ['Tuần', 604800], mo: ['Tháng (30 ngày)', 2592000], y: ['Năm (365 ngày)', 31536000] }, 'h', 'min'],
  data: ['Dữ liệu', { b: ['Byte (B)', 1], kb: ['Kilobyte (KB)', 1024], mb: ['Megabyte (MB)', 1048576], gb: ['Gigabyte (GB)', 1073741824], tb: ['Terabyte (TB)', 1099511627776], bit: ['Bit', 0.125] }, 'gb', 'mb'],
  rate: ['Tốc độ mạng', { mbps: ['Mbps (megabit/giây)', 125000], mbs: ['MB/s (megabyte/giây)', 1000000], kbps: ['Kbps', 125], gbps: ['Gbps', 125000000] }, 'mbps', 'mbs'],
  energy: ['Năng lượng', { j: ['Joule (J)', 1], kj: ['Kilojoule (kJ)', 1000], kwh: ['kWh (số điện)', 3.6e6], cal: ['Calo (cal)', 4.184], kcal: ['Kilocalo (kcal)', 4184] }, 'kwh', 'j']
};
function convTemp(v, a, b) { const c = a === 'c' ? v : a === 'f' ? (v - 32) * 5 / 9 : v - 273.15; return b === 'c' ? c : b === 'f' ? c * 9 / 5 + 32 : c + 273.15; }
D({ slug: 'chuyen-doi-don-vi', name: 'Chuyển đổi đơn vị', cat: 'convert', icon: '📐', desc: 'Đổi độ dài, khối lượng, nhiệt độ, diện tích, dữ liệu và hơn thế', pop: 88,
  kw: 'unit converter doi don vi km m cm inch feet kg lb do c do f lit gallon ha m2 mb gb mbps kwh', h1: 'Chuyển đổi đơn vị online',
  aliases: (TI.CATALOG || []).filter(r => r[2] === 'convert').map(r => r[0]).concat(['file-size-converter']), related: ['usd-sang-vnd', 'tinh-phan-tram', 'hex-sang-rgb'],
  faq: [['1 inch bằng bao nhiêu cm?', '1 inch = 2,54 cm.'], ['1 sào bằng bao nhiêu mét vuông?', 'Sào Bắc Bộ = 360 m², sào Trung Bộ = 500 m². Công cụ dùng sào Bắc Bộ.'], ['1 Mbps bằng bao nhiêu MB/s?', '1 Mbps = 0,125 MB/s (chia cho 8).']],
  render(root, ctx) {
    let g = 'length';
    root.innerHTML = '<div class="chips" id="grp">' + Object.entries(UNITS).map(([k, u]) => '<button class="chip" type="button" data-v="' + k + '" aria-pressed="' + (k === g) + '">' + u[0] + '</button>').join('') + '</div>' +
      '<div class="split"><div class="field"><label class="label" for="v">Giá trị</label><input class="input num" id="v" inputmode="decimal" value="1"></div><div class="field"><label class="label" for="from">Từ đơn vị</label><select class="select" id="from"></select></div></div>' +
      '<div class="row"><button class="btn btn-sm" type="button" id="swap">⇅ Đảo chiều</button></div>' +
      '<div class="field"><label class="label" for="to">Sang đơn vị</label><select class="select" id="to"></select></div>' + U.result('res', 'Kết quả') + '<div class="tbl-wrap"><table class="tbl" id="all"></table></div>';
    const fill = () => {
      const [, units, a, b] = UNITS[g]; const opts = Object.entries(units).map(([k, u]) => '<option value="' + k + '">' + u[0] + '</option>').join('');
      U.$(root, '#from').innerHTML = opts; U.$(root, '#to').innerHTML = opts; U.$(root, '#from').value = a; U.$(root, '#to').value = b; run();
    };
    const conv = (v, a, b) => g === 'temp' ? convTemp(v, a, b) : v * UNITS[g][1][a][1] / UNITS[g][1][b][1];
    const run = () => {
      const v = U.val(root, 'v'), a = U.$(root, '#from').value, b = U.$(root, '#to').value, units = UNITS[g][1];
      if (isNaN(v)) { U.setResult(root, 'res', { value: '—' }); return; }
      const r = conv(v, a, b);
      U.setResult(root, 'res', { value: fmt(r, 6) + ' ' + units[b][0].replace(/.*\((.*)\)/, '$1'), formula: fmt(v, 6) + ' ' + units[a][0] + ' = ' + fmt(r, 6) + ' ' + units[b][0], copy: fmt(r, 6) });
      U.$(root, '#all').innerHTML = '<thead><tr><th>Đơn vị</th><th>' + fmt(v, 6) + ' ' + esc(units[a][0]) + ' =</th></tr></thead><tbody>' + Object.entries(units).filter(([k]) => k !== a).map(([k, u]) => '<tr><td>' + esc(u[0]) + '</td><td>' + fmt(conv(v, a, k), 6) + '</td></tr>').join('') + '</tbody>';
    };
    U.$(root, '#grp').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; U.$$(root, '#grp .chip').forEach(x => x.setAttribute('aria-pressed', x === b)); g = b.dataset.v; fill(); });
    U.$(root, '#swap').onclick = () => { const f = U.$(root, '#from'), t = U.$(root, '#to'), x = f.value; f.value = t.value; t.value = x; run(); };
    root.addEventListener('input', run); root.addEventListener('change', run); U.bindCopy(root, ctx); fill();
  } });

/* ---------- finance/currency ---------- */
const RATES = { USD: 26300, EUR: 30500, CNY: 3650, JPY: 175, KRW: 19, GBP: 35300, AUD: 17200, SGD: 20300, THB: 800 };
D({ slug: 'usd-sang-vnd', name: 'Đổi USD → VND', cat: 'finance', icon: '💱', desc: 'Quy đổi USD, EUR, CNY, JPY, KRW… sang tiền Việt theo tỷ giá bạn nhập', pop: 86,
  kw: 'usd vnd doi tien ty gia do la tien te currency converter euro te nhan dan yen won bath dola', h1: 'Đổi USD sang VND',
  aliases: ['usd-vnd', 'eur-vnd', 'cny-vnd', 'jpy-vnd', 'krw-vnd', 'gbp-vnd', 'aud-vnd', 'sgd-vnd', 'thb-vnd', 'multi-currency-converter', 'currency-trip-calculator'],
  related: ['chuyen-doi-don-vi', 'tinh-vat', 'tinh-loi-nhuan', 'tinh-phan-tram'],
  server: 'Tính trên trình duyệt. Tỷ giá mặc định chỉ để tham khảo; bản chính thức sẽ cập nhật tỷ giá từ máy chủ mỗi ngày.',
  faq: [['Tỷ giá lấy từ đâu?', 'Tỷ giá mặc định là số tham khảo. Hãy nhập tỷ giá mua/bán của ngân hàng bạn dùng để có kết quả chính xác; công cụ sẽ nhớ tỷ giá bạn nhập.']],
  render(root, ctx) {
    const saved = ctx.state({}); const rates = Object.assign({}, RATES, saved.rates || {});
    let cur = saved.cur || 'USD', dir = 'to';
    root.innerHTML = '<div class="chips" id="cur">' + Object.keys(RATES).map(c => '<button class="chip" type="button" data-v="' + c + '" aria-pressed="' + (c === cur) + '">' + c + '</button>').join('') + '</div>' +
      '<div class="form-grid"><div class="field"><label class="label" for="amt" id="amt-l">Số tiền</label><div class="input-group"><input class="input num" id="amt" inputmode="decimal" value="100"><span class="unit" id="amt-u"></span></div></div>' +
      '<div class="field"><label class="label" for="rate" id="rate-l">Tỷ giá</label><div class="input-group"><input class="input num" id="rate" inputmode="decimal"><span class="unit">₫</span></div><span class="hint">Tỷ giá tham khảo, sửa theo ngân hàng của bạn</span></div></div>' +
      '<div class="row"><button class="btn btn-sm" type="button" id="swap">⇅ Đổi chiều VND → ngoại tệ</button></div>' + U.result('res', 'Quy đổi');
    const run = () => {
      const a = U.val(root, 'amt'), r = U.val(root, 'rate');
      U.$(root, '#amt-u').textContent = dir === 'to' ? cur : 'VND'; U.$(root, '#rate-l').textContent = 'Tỷ giá 1 ' + cur;
      U.$(root, '#swap').textContent = dir === 'to' ? '⇅ Đổi chiều VND → ' + cur : '⇅ Đổi chiều ' + cur + ' → VND';
      if (isNaN(a) || isNaN(r) || !r) { U.setResult(root, 'res', { value: '—' }); return; }
      rates[cur] = r; ctx.save({ cur, rates });
      if (dir === 'to') U.setResult(root, 'res', { value: money(a * r), copy: Math.round(a * r), formula: fmt(a, 2) + ' ' + cur + ' × ' + fmt(r, 2) + ' = ' + fmt(a * r, 0) + ' ₫' });
      else U.setResult(root, 'res', { value: fmt(a / r, 2) + ' ' + cur, copy: (a / r).toFixed(2), formula: fmt(a, 0) + ' ₫ / ' + fmt(r, 2) + ' = ' + fmt(a / r, 2) + ' ' + cur });
    };
    const setCur = () => { U.$(root, '#rate').value = fmt(rates[cur], 2); run(); };
    U.bindChips(root, 'cur', v => { cur = v; setCur(); });
    U.$(root, '#swap').onclick = () => { dir = dir === 'to' ? 'from' : 'to'; U.$(root, '#amt').value = dir === 'to' ? '100' : '1.000.000'; run(); };
    root.addEventListener('input', run); U.bindCopy(root, ctx); setCur();
  } });

/* ---------- finance/profit ---------- */
D({ slug: 'tinh-loi-nhuan', name: 'Tính lợi nhuận', cat: 'finance', icon: '📈', desc: 'Lợi nhuận mỗi đơn, biên lợi nhuận và markup sau phí sàn', pop: 87,
  kw: 'profit calculator loi nhuan lai lo bien loi nhuan margin markup gia von gia ban phi san shopee tiktok', h1: 'Tính lợi nhuận bán hàng',
  aliases: ['tinh-bien-loi-nhuan', 'tinh-markup'], related: ['tinh-roas', 'tinh-acos', 'tinh-phi-san', 'tinh-gia-ban-tu-gia-von', 'tinh-diem-hoa-von'],
  faq: [['Biên lợi nhuận khác markup thế nào?', 'Biên lợi nhuận = Lợi nhuận / Giá bán. Markup = Lợi nhuận / Giá vốn. Cùng một đơn hàng, markup luôn lớn hơn biên lợi nhuận.']],
  render(root, ctx) {
    U.calc(root, ctx, { label: 'Lợi nhuận mỗi đơn',
      fields: [{ id: 'cost', label: 'Giá vốn', unit: '₫', value: '120.000' }, { id: 'price', label: 'Giá bán', unit: '₫', value: '199.000' }, { id: 'fee', label: 'Phí sàn / thanh toán', unit: '%', value: '12' }, { id: 'other', label: 'Chi phí khác mỗi đơn', unit: '₫', value: '8.000', hint: 'Đóng gói, vận chuyển, quà tặng…' }, { id: 'qty', label: 'Số đơn', unit: 'đơn', value: '100' }],
      compute: v => { if ([v.cost, v.price].some(isNaN)) return null; const fee = (v.fee || 0) / 100 * v.price, oth = v.other || 0, p = v.price - v.cost - fee - oth, q = isNaN(v.qty) ? 1 : v.qty;
        const margin = p / v.price * 100, mk = p / v.cost * 100;
        return { value: money(p), copy: Math.round(p), formula: fmt(v.price, 0) + ' − ' + fmt(v.cost, 0) + ' − ' + fmt(fee, 0) + ' (phí) − ' + fmt(oth, 0) + ' = ' + fmt(p, 0),
          note: '<span class="badge ' + (p >= 0 ? 'badge-new' : '') + '" style="' + (p < 0 ? 'background:var(--danger-soft);color:var(--danger)' : '') + '">' + (p >= 0 ? 'Có lãi' : 'Đang lỗ') + '</span> Biên lợi nhuận <b>' + fmt(margin, 2) + '%</b> · Markup <b>' + fmt(mk, 2) + '%</b> · Tổng ' + fmt(q, 0) + ' đơn: <b>' + money(p * q) + '</b>' }; } });
  } });

/* ---------- marketing/roas ---------- */
D({ slug: 'tinh-roas', name: 'Tính ROAS', cat: 'marketing', icon: '🎯', desc: 'Tính ROAS quảng cáo và ROAS hòa vốn theo biên lợi nhuận', pop: 84, isNew: true,
  kw: 'roas return on ad spend quang cao facebook ads google ads tiktok ads hieu qua quang cao roas hoa von break even', h1: 'Tính ROAS quảng cáo',
  seoTitle: 'Tính ROAS Online – ROAS Hòa Vốn, Hiệu Quả Quảng Cáo', aliases: ['roas-calculator', 'break-even-roas', 'tinh-roas-hoa-von'],
  related: ['tinh-acos', 'tinh-loi-nhuan', 'tinh-cpa', 'tinh-ctr', 'tinh-roi'],
  faq: [['ROAS bao nhiêu là tốt?', 'ROAS tốt khi lớn hơn ROAS hòa vốn = 1 / biên lợi nhuận. Biên lợi nhuận 25% thì ROAS hòa vốn là 4.'], ['ROAS khác ROI thế nào?', 'ROAS chỉ so doanh thu với chi phí quảng cáo. ROI so lợi nhuận với toàn bộ chi phí đầu tư.']],
  render(root, ctx) {
    U.calc(root, ctx, { label: 'ROAS', fields: [{ id: 'rev', label: 'Doanh thu từ quảng cáo', unit: '₫', value: '45.000.000' }, { id: 'spend', label: 'Chi phí quảng cáo', unit: '₫', value: '10.000.000' }, { id: 'm', label: 'Biên lợi nhuận gộp', unit: '%', value: '30', hint: 'Dùng để tính ROAS hòa vốn' }],
      compute: v => { if (isNaN(v.rev) || !v.spend) return null; const r = v.rev / v.spend; const be = v.m > 0 ? 100 / v.m : NaN; const ok = isNaN(be) ? null : r >= be;
        return { value: fmt(r, 2) + 'x', copy: fmt(r, 2), formula: fmt(v.rev, 0) + ' / ' + fmt(v.spend, 0) + ' = ' + fmt(r, 2) + ' (' + fmt(r * 100, 0) + '%)',
          note: isNaN(be) ? 'Mỗi 1 ₫ quảng cáo mang về ' + fmt(r, 2) + ' ₫ doanh thu.' : 'ROAS hòa vốn: <b>' + fmt(be, 2) + 'x</b> · ' + (ok ? '<b style="color:var(--success)">Có lãi</b> sau chi phí quảng cáo' : '<b style="color:var(--danger)">Chưa hòa vốn</b>, cần ROAS ≥ ' + fmt(be, 2)) }; } });
  } });

/* ---------- marketing/acos ---------- */
D({ slug: 'tinh-acos', name: 'Tính ACOS', cat: 'marketing', icon: '📉', desc: 'Tính ACOS (chi phí quảng cáo / doanh thu) và so với mục tiêu', pop: 70, isNew: true,
  kw: 'acos advertising cost of sale amazon shopee ads ty le chi phi quang cao tren doanh thu', h1: 'Tính ACOS online', aliases: ['acos-calculator', 'tinh-acos-tu-roas'],
  related: ['tinh-roas', 'tinh-loi-nhuan', 'tinh-cpc', 'tinh-conversion-rate'],
  faq: [['ACOS là gì?', 'ACOS = Chi phí quảng cáo / Doanh thu từ quảng cáo × 100. ACOS thấp nghĩa là quảng cáo hiệu quả hơn.'], ['ACOS và ROAS liên hệ thế nào?', 'ACOS = 1 / ROAS. ROAS 4 tương đương ACOS 25%.']],
  render(root, ctx) {
    U.calc(root, ctx, { label: 'ACOS', fields: [{ id: 'spend', label: 'Chi phí quảng cáo', unit: '₫', value: '3.000.000' }, { id: 'rev', label: 'Doanh thu từ quảng cáo', unit: '₫', value: '15.000.000' }, { id: 't', label: 'ACOS mục tiêu (≈ biên lợi nhuận)', unit: '%', value: '25' }],
      compute: v => { if (isNaN(v.spend) || !v.rev) return null; const a = v.spend / v.rev * 100;
        return { value: fmt(a, 2) + '%', copy: fmt(a, 2) + '%', formula: fmt(v.spend, 0) + ' / ' + fmt(v.rev, 0) + ' × 100 = ' + fmt(a, 2) + '%',
          note: 'Tương đương ROAS <b>' + fmt(100 / a, 2) + 'x</b>' + (v.t > 0 ? ' · ' + (a <= v.t ? '<b style="color:var(--success)">Đạt mục tiêu</b>' : '<b style="color:var(--danger)">Vượt mục tiêu ' + fmt(a - v.t, 2) + ' điểm %</b>') : '') }; } });
  } });

/* ---------- vn/salary ---------- */
const VN = { base: 2340000, min: { 1: 5310000, 2: 4730000, 3: 4140000, 4: 3700000 }, self: 15500000, dep: 6200000,
  brackets: [[10e6, 0.05], [30e6, 0.10], [60e6, 0.20], [100e6, 0.30], [Infinity, 0.35]] };
function pit(ti, br) { let tax = 0, prev = 0; const rows = []; for (const [cap, r] of br) { if (ti <= prev) break; const part = Math.min(ti, cap) - prev; tax += part * r; rows.push([prev, cap, r, part * r]); prev = cap; } return { tax, rows }; }
function grossToNet(g, o) {
  const insBase = o.insBase > 0 ? o.insBase : g;
  const capSI = 20 * o.base, capUI = 20 * o.min[o.region];
  const si = Math.min(insBase, capSI) * 0.08, hi = Math.min(insBase, capSI) * 0.015, ui = Math.min(insBase, capUI) * 0.01;
  const ins = si + hi + ui, ded = o.self + o.dep * o.deps, ti = Math.max(0, g - ins - ded);
  const p = pit(ti, o.brackets);
  const er = Math.min(insBase, capSI) * (0.175 + 0.03) + Math.min(insBase, capUI) * 0.01;
  return { g, si, hi, ui, ins, ded, ti, tax: p.tax, rows: p.rows, net: g - ins - p.tax, er };
}
D({ slug: 'tinh-luong-gross-net', name: 'Tính lương Gross → Net', cat: 'vn', icon: '💵', desc: 'Lương thực nhận sau BHXH, BHYT, BHTN và thuế TNCN theo quy định 2026', pop: 89, isNew: true, level: 2,
  kw: 'luong gross net luong thuc nhan thue thu nhap ca nhan tncn bhxh bao hiem xa hoi giam tru gia canh net sang gross salary vietnam', h1: 'Tính lương Gross sang Net',
  seoTitle: 'Tính Lương Gross Sang Net 2026 – Thuế TNCN, BHXH Mới Nhất', aliases: ['tinh-luong-gross-sang-net', 'tinh-luong-net-sang-gross', 'tinh-bhxh', 'tinh-thue-tncn'],
  related: ['tinh-phan-tram', 'tinh-vat', 'tinh-luong-ot', 'usd-sang-vnd'],
  faq: [['Giảm trừ gia cảnh năm 2026 là bao nhiêu?', 'Bản thân 15,5 triệu đồng/tháng, mỗi người phụ thuộc 6,2 triệu đồng/tháng (áp dụng từ kỳ tính thuế 2026).'], ['Mức đóng bảo hiểm của người lao động?', 'BHXH 8%, BHYT 1,5%, BHTN 1%. BHXH và BHYT tối đa trên 20 lần lương cơ sở; BHTN tối đa trên 20 lần lương tối thiểu vùng.'], ['Kết quả có chính xác tuyệt đối không?', 'Công cụ dùng tham số mặc định có thể chỉnh trong “Tham số”. Hãy đối chiếu với bộ phận nhân sự cho trường hợp đặc biệt (phụ cấp miễn thuế, thu nhập khác).']],
  render(root, ctx) {
    let mode = 'g2n';
    root.innerHTML = U.tabs('mode', [['g2n', 'Gross → Net'], ['n2g', 'Net → Gross']], mode) +
      '<div class="form-grid">' + U.num('amt', 'Lương Gross', { unit: '₫/tháng', value: '30.000.000' }) + U.num('deps', 'Số người phụ thuộc', { value: '1', mode: 'numeric' }) +
      U.select('region', 'Vùng lương tối thiểu', [[1, 'Vùng I'], [2, 'Vùng II'], [3, 'Vùng III'], [4, 'Vùng IV']], 1) +
      U.num('ib', 'Lương đóng bảo hiểm', { unit: '₫', ph: 'Bằng lương chính thức', hint: 'Để trống nếu đóng trên toàn bộ lương' }) + '</div>' +
      '<details class="card card-pad" style="background:var(--surface-sunken);border:0"><summary style="cursor:pointer;font-weight:600">Tham số (có thể chỉnh)</summary><div class="form-grid" style="margin-top:12px">' +
      U.num('p-base', 'Lương cơ sở', { unit: '₫', value: fmt(VN.base, 0) }) + U.num('p-self', 'Giảm trừ bản thân', { unit: '₫', value: fmt(VN.self, 0) }) + U.num('p-dep', 'Giảm trừ / người phụ thuộc', { unit: '₫', value: fmt(VN.dep, 0) }) +
      U.num('p-min', 'Lương tối thiểu vùng đã chọn', { unit: '₫', value: fmt(VN.min[1], 0) }) + '</div><p class="hint" style="margin-top:8px">Biểu thuế lũy tiến 5 bậc: đến 10 tr 5% · 10–30 tr 10% · 30–60 tr 20% · 60–100 tr 30% · trên 100 tr 35%.</p></details>' +
      '<button class="btn btn-primary btn-lg btn-block" type="button" data-calc>Tính lương</button>' + U.result('res', 'Lương thực nhận (Net)') + '<div class="tbl-wrap"><table class="tbl" id="tbl"></table></div>';
    const opts = () => ({ base: U.val(root, 'p-base') || VN.base, self: U.val(root, 'p-self') || VN.self, dep: U.val(root, 'p-dep') || VN.dep, deps: Math.max(0, U.val(root, 'deps') || 0),
      region: +U.$(root, '#region').value, min: Object.assign({}, VN.min, { [U.$(root, '#region').value]: U.val(root, 'p-min') || VN.min[U.$(root, '#region').value] }), insBase: U.val(root, 'ib') || 0, brackets: VN.brackets });
    const run = () => {
      const a = U.val(root, 'amt'); if (isNaN(a) || a <= 0) { U.setResult(root, 'res', { value: '—' }); U.$(root, '#tbl').innerHTML = ''; return; }
      const o = opts(); let r;
      if (mode === 'g2n') r = grossToNet(a, o);
      else { let lo = a, hi = a * 2 + 1e7; for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (grossToNet(mid, o).net < a) lo = mid; else hi = mid; } r = grossToNet(Math.round(hi), o); }
      U.setResult(root, 'res', mode === 'g2n' ? { value: money(r.net), copy: Math.round(r.net), formula: 'Gross ' + fmt(r.g, 0) + ' − Bảo hiểm ' + fmt(r.ins, 0) + ' − Thuế TNCN ' + fmt(r.tax, 0) + ' = ' + fmt(r.net, 0) }
        : { value: money(r.g), copy: Math.round(r.g), formula: 'Để nhận ' + fmt(a, 0) + ' ₫ Net cần lương Gross ' + fmt(r.g, 0) + ' ₫' });
      U.$(root, '.result-label').textContent = mode === 'g2n' ? 'Lương thực nhận (Net)' : 'Lương Gross cần có';
      const row = (k, v, cls) => '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + k + '</td><td>' + (typeof v === 'number' ? fmt(Math.round(v), 0) : v) + '</td></tr>';
      U.$(root, '#tbl').innerHTML = '<thead><tr><th>Diễn giải</th><th>Số tiền (₫)</th></tr></thead><tbody>' +
        row('Lương Gross', r.g) + row('BHXH (8%)', -r.si) + row('BHYT (1,5%)', -r.hi) + row('BHTN (1%)', -r.ui) + row('Thu nhập trước thuế', r.g - r.ins) +
        row('Giảm trừ bản thân', -o.self) + row('Giảm trừ ' + o.deps + ' người phụ thuộc', -o.dep * o.deps) + row('Thu nhập chịu thuế', r.ti) +
        r.rows.map(([p, c, rt, t]) => row('&nbsp;&nbsp;Bậc ' + fmt(p / 1e6, 0) + (c === Infinity ? '+ tr' : '–' + fmt(c / 1e6, 0) + ' tr') + ' (' + rt * 100 + '%)', t)).join('') +
        row('Thuế TNCN', -r.tax) + row('Lương Net', r.net, 'total') + row('<span class="muted">Chi phí doanh nghiệp đóng thêm (21,5%)</span>', r.er) + row('<span class="muted">Tổng chi phí doanh nghiệp</span>', r.g + r.er) + '</tbody>';
    };
    U.bindTabs(root, 'mode', v => { mode = v; root.querySelector('label[for="amt"]').textContent = v === 'g2n' ? 'Lương Gross' : 'Lương Net mong muốn'; U.$(root, '#amt').value = v === 'g2n' ? '30.000.000' : '25.000.000'; run(); });
    U.$(root, '#region').addEventListener('change', () => { U.$(root, '#p-min').value = fmt(VN.min[U.$(root, '#region').value], 0); run(); });
    root.addEventListener('input', run); U.$(root, '[data-calc]').onclick = () => { run(); U.$(root, '#res').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    U.bindCopy(root, ctx); run();
  } });
})();
