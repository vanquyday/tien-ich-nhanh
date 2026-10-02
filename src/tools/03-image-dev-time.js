/* Modules: tools/qr/*, tools/security/*, tools/image/*, tools/developer/*, tools/design/*, tools/datetime timers, typing test */
(function () {
const TI = window.TI, U = TI.ui, D = TI.define, esc = TI.esc, fmt = TI.fmt;

/* ---------- qr/generator ---------- */
D({ slug: 'tao-qr-code', name: 'Tạo QR Code', cat: 'qr', icon: '🔳', desc: 'Tạo mã QR cho link, văn bản, WiFi, số điện thoại; tải PNG hoặc SVG', pop: 94,
  kw: 'qr code generator tao ma qr wifi qr link url vcard ma vach qr chuyen khoan', h1: 'Tạo mã QR Code online', seoTitle: 'Tạo QR Code Online Miễn Phí – QR Link, WiFi, Văn Bản',
  aliases: ['qr-code-url', 'qr-code-text', 'qr-code-wifi', 'qr-contact-card'], related: ['tao-mat-khau', 'resize-anh', 'utm-builder', 'tao-barcode'],
  faq: [['Mã QR có hết hạn không?', 'Không. Mã QR tạo ở đây là mã tĩnh, chứa trực tiếp nội dung, dùng mãi mãi.'], ['Mức sửa lỗi nên chọn gì?', 'Chọn M cho hầu hết trường hợp. Chọn Q hoặc H nếu in trên bề mặt dễ bẩn, trầy xước.'], ['QR WiFi dùng thế nào?', 'Khách mở camera điện thoại quét mã là kết nối WiFi, không cần gõ mật khẩu.']],
  how: ['Chọn loại nội dung: liên kết, văn bản, WiFi hoặc số điện thoại.', 'Nhập nội dung, mã QR cập nhật ngay.', 'Chọn màu, kích thước rồi tải PNG/SVG.'],
  render(root, ctx) {
    let type = 'url';
    root.innerHTML = U.tabs('type', [['url', 'Liên kết'], ['text', 'Văn bản'], ['wifi', 'WiFi'], ['tel', 'Điện thoại']], type) +
      '<div class="split wide-left"><div class="stack" id="form"></div><div class="stack"><div class="qr-out"><canvas id="cv" width="300" height="300" aria-label="Mã QR"></canvas></div><div class="t-small muted" id="info" style="text-align:center"></div>' +
      '<div class="btn-row" style="justify-content:center"><button class="btn btn-primary" type="button" id="png">Tải PNG</button><button class="btn" type="button" id="svg">Tải SVG</button></div></div></div>' +
      '<div class="form-grid">' + U.select('ecl', 'Mức sửa lỗi', [['L', 'L – 7%'], ['M', 'M – 15%'], ['Q', 'Q – 25%'], ['H', 'H – 30%']], 'M') + U.select('px', 'Kích thước tải về', [[512, '512 px'], [1024, '1024 px'], [2048, '2048 px']], 1024) +
      '<div class="field"><label class="label" for="fg">Màu mã</label><input class="input" type="color" id="fg" value="#111827" style="padding:4px;height:44px"></div><div class="field"><label class="label" for="bg">Màu nền</label><input class="input" type="color" id="bg" value="#ffffff" style="padding:4px;height:44px"></div></div>';
    const forms = {
      url: '<div class="field"><label class="label" for="q-url">Đường dẫn</label><input class="input" id="q-url" value="https://tienichnhanh.vn" inputmode="url"></div>',
      text: '<div class="field"><label class="label" for="q-text">Nội dung</label><textarea class="textarea" id="q-text" rows="4">Cảm ơn bạn đã ghé cửa hàng!</textarea></div>',
      wifi: '<div class="form-grid"><div class="field"><label class="label" for="q-ssid">Tên WiFi (SSID)</label><input class="input" id="q-ssid" value="Cafe-Nha-Minh"></div><div class="field"><label class="label" for="q-pw">Mật khẩu</label><input class="input" id="q-pw" value="cafe2026"></div>' + U.select('q-enc', 'Bảo mật', [['WPA', 'WPA/WPA2'], ['WEP', 'WEP'], ['nopass', 'Không mật khẩu']], 'WPA') + '</div>',
      tel: '<div class="field"><label class="label" for="q-tel">Số điện thoại</label><input class="input" id="q-tel" value="0901234567" inputmode="tel"></div>'
    };
    const content = () => { const v = id => (U.$(root, '#' + id) || {}).value || '';
      if (type === 'url') return v('q-url'); if (type === 'text') return v('q-text'); if (type === 'tel') return 'tel:' + v('q-tel').replace(/\s/g, '');
      const e = s => s.replace(/([\\;,:"])/g, '\\$1'); return 'WIFI:T:' + v('q-enc') + ';S:' + e(v('q-ssid')) + ';' + (v('q-enc') === 'nopass' ? '' : 'P:' + e(v('q-pw')) + ';') + ';'; };
    let q = null;
    const draw = () => {
      const t = content(); const cv = U.$(root, '#cv'), g = cv.getContext('2d');
      if (!t) { g.clearRect(0, 0, cv.width, cv.height); U.$(root, '#info').textContent = 'Nhập nội dung để tạo mã'; q = null; return; }
      try { q = TI.qr(t, U.$(root, '#ecl').value); } catch (e) { U.$(root, '#info').textContent = e.message; q = null; return; }
      paint(cv, 300); U.$(root, '#info').textContent = 'Phiên bản ' + q.version + ' · ' + q.size + '×' + q.size + ' ô · ' + new TextEncoder().encode(t).length + ' byte';
    };
    const paint = (cv, px) => { const n = q.size + 8, s = Math.floor(px / n) || 1; cv.width = cv.height = s * n; const g = cv.getContext('2d');
      g.fillStyle = U.$(root, '#bg').value; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = U.$(root, '#fg').value;
      q.modules.forEach((row, y) => row.forEach((d, x) => { if (d) g.fillRect((x + 4) * s, (y + 4) * s, s, s); })); };
    const setForm = () => { U.$(root, '#form').innerHTML = forms[type]; draw(); };
    U.bindTabs(root, 'type', v => { type = v; setForm(); });
    root.addEventListener('input', draw); root.addEventListener('change', draw);
    U.$(root, '#png').onclick = () => { if (!q) return ctx.toast('Chưa có mã QR'); const c = document.createElement('canvas'); paint(c, +U.$(root, '#px').value); c.toBlob(b => ctx.download('ma-qr.png', b), 'image/png'); };
    U.$(root, '#svg').onclick = () => { if (!q) return ctx.toast('Chưa có mã QR'); const n = q.size + 8; let p = '';
      q.modules.forEach((row, y) => row.forEach((d, x) => { if (d) p += 'M' + (x + 4) + ' ' + (y + 4) + 'h1v1h-1z'; }));
      ctx.download('ma-qr.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="' + U.$(root, '#bg').value + '"/><path d="' + p + '" fill="' + U.$(root, '#fg').value + '"/></svg>', 'image/svg+xml'); };
    setForm();
  } });

/* ---------- security/password ---------- */
D({ slug: 'tao-mat-khau', name: 'Tạo mật khẩu mạnh', cat: 'security', icon: '🔑', desc: 'Tạo mật khẩu ngẫu nhiên an toàn, tùy chọn độ dài và ký tự', pop: 90,
  kw: 'password generator tao mat khau manh random password mat khau ngau nhien bao mat pass', h1: 'Tạo mật khẩu mạnh ngẫu nhiên', seoTitle: 'Tạo Mật Khẩu Mạnh Online – Password Generator An Toàn',
  aliases: ['password-generator', 'random-password', 'secret-key-generator', 'password-strength-checker'], related: ['uuid-generator', 'ma-hoa-base64', 'tao-qr-code', 'hash-generator'],
  faq: [['Mật khẩu có bị lưu hoặc gửi đi không?', 'Không. Mật khẩu được tạo bằng crypto.getRandomValues ngay trên trình duyệt và không rời khỏi máy bạn.'], ['Mật khẩu bao nhiêu ký tự là đủ mạnh?', 'Từ 14 ký tự trở lên, có chữ hoa, chữ thường, số và ký hiệu.']],
  render(root, ctx) {
    const sets = { up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', low: 'abcdefghijklmnopqrstuvwxyz', num: '0123456789', sym: '!@#$%^&*()-_=+[]{};:,.?/' };
    root.innerHTML = '<div class="result"><div class="result-head"><span class="result-label">Mật khẩu</span><span class="badge" id="lvl"></span></div><div class="result-value md mono" id="pw" style="font-family:var(--font-mono)"></div><div class="progress" id="bar"><span></span></div><div class="result-note" id="ent"></div></div>' +
      '<div class="btn-row"><button class="btn btn-primary btn-lg" type="button" id="gen" style="flex:1">Tạo mật khẩu mới</button><button class="btn btn-lg" type="button" id="cp">Sao chép</button></div>' +
      '<div class="field"><label class="label" for="len">Độ dài: <b id="lenv">16</b> ký tự</label><input class="range" type="range" id="len" min="6" max="64" value="16"></div>' +
      '<div class="form-grid"><label class="check"><input type="checkbox" id="up" checked>Chữ hoa (A–Z)</label><label class="check"><input type="checkbox" id="low" checked>Chữ thường (a–z)</label><label class="check"><input type="checkbox" id="num" checked>Số (0–9)</label><label class="check"><input type="checkbox" id="sym" checked>Ký hiệu (!@#…)</label><label class="check"><input type="checkbox" id="amb">Bỏ ký tự dễ nhầm (l, 1, O, 0)</label></div>' +
      '<div class="field"><span class="label">Tạo nhiều mật khẩu</span><div class="out-box" id="many" style="min-height:0"></div><div class="row"><button class="btn btn-sm" type="button" id="gen5">Tạo 5 mật khẩu</button><button class="btn btn-sm" type="button" id="cp5">Sao chép danh sách</button></div></div>';
    const make = () => { let pool = '', req = []; Object.keys(sets).forEach(k => { if (U.$(root, '#' + k).checked) { let s = sets[k]; if (U.$(root, '#amb').checked) s = s.replace(/[l1IO0o]/g, ''); pool += s; req.push(s); } });
      if (!pool) return null; const len = +U.$(root, '#len').value; let out;
      do { out = Array.from({ length: len }, () => pool[U.rand(pool.length)]); } while (len >= req.length && !req.every(s => out.some(c => s.includes(c))));
      return { pw: out.join(''), bits: len * Math.log2(pool.length) }; };
    const gen = () => { U.$(root, '#lenv').textContent = U.$(root, '#len').value; const r = make(); if (!r) { U.$(root, '#pw').textContent = 'Chọn ít nhất một loại ký tự'; return; }
      U.$(root, '#pw').textContent = r.pw; const b = r.bits; const [lv, cls, w] = b < 40 ? ['Yếu', 'danger', 25] : b < 64 ? ['Trung bình', 'warning', 50] : b < 90 ? ['Mạnh', 'success', 78] : ['Rất mạnh', 'success', 100];
      U.$(root, '#lvl').textContent = lv; U.$(root, '#bar').className = 'progress ' + cls; U.$(root, '#bar span').style.width = w + '%'; U.$(root, '#ent').textContent = 'Độ mạnh ≈ ' + Math.round(b) + ' bit entropy'; };
    root.addEventListener('input', gen); root.addEventListener('change', gen);
    U.$(root, '#gen').onclick = gen; U.$(root, '#cp').onclick = () => ctx.copy(U.$(root, '#pw').textContent);
    U.$(root, '#gen5').onclick = () => { U.$(root, '#many').textContent = Array.from({ length: 5 }, () => (make() || {}).pw || '').join('\n'); };
    U.$(root, '#cp5').onclick = () => U.$(root, '#many').textContent ? ctx.copy(U.$(root, '#many').textContent) : ctx.toast('Bấm “Tạo 5 mật khẩu” trước');
    gen();
  } });

/* ---------- typing test ---------- */
const PASSAGES = ['Mỗi buổi sáng tôi pha một ấm trà, mở cửa sổ và lên kế hoạch cho ngày mới. Việc nhỏ làm đều đặn mỗi ngày sẽ tạo nên thay đổi lớn sau một năm.',
  'Hà Nội vào thu có gió heo may và mùi hoa sữa. Người ta đi chậm lại một chút trên những con phố cũ, ghé quán cà phê quen và nghe tiếng rao quà sáng.',
  'Gõ phím nhanh không quan trọng bằng gõ chính xác. Hãy giữ tư thế thẳng lưng, đặt tay đúng hàng phím cơ sở và nhìn vào màn hình thay vì bàn phím.',
  'Một sản phẩm tốt bắt đầu từ việc lắng nghe khách hàng. Ghi lại phản hồi, sắp xếp theo mức độ quan trọng và cải tiến từng phần nhỏ mỗi tuần.'];
D({ slug: 'kiem-tra-toc-do-go-phim', name: 'Kiểm tra tốc độ gõ phím', cat: 'study', icon: '⌨️', desc: 'Đo tốc độ gõ tiếng Việt (WPM) và độ chính xác trong 60 giây', pop: 86, isNew: true,
  kw: 'typing speed test wpm go phim nhanh kiem tra toc do danh may go 10 ngon typing test tieng viet', h1: 'Kiểm tra tốc độ gõ phím tiếng Việt',
  aliases: ['typing-speed-test', 'wpm-test', 'typing-accuracy-test'], related: ['dem-tu', 'dem-ky-tu', 'pomodoro', 'bam-gio'],
  faq: [['WPM được tính thế nào?', 'WPM = số ký tự gõ đúng / 5 / số phút. Đây là cách tính chuẩn quốc tế.'], ['Dùng bộ gõ Telex hay VNI được không?', 'Được. Công cụ so sánh chữ sau khi bộ gõ đã ghép dấu.']],
  render(root, ctx) {
    let target = '', t0 = 0, timer = null, done = false, dur = 60;
    root.innerHTML = '<div class="spread">' + U.chips('dur', [[30, '30 giây'], [60, '60 giây'], [120, '2 phút']], 60) + '<button class="btn btn-sm" type="button" id="new">Đoạn văn khác</button></div>' +
      '<div class="typing-text" id="tt" aria-hidden="true"></div><label class="sr-only" for="inp">Gõ lại đoạn văn</label><textarea class="textarea" id="inp" rows="3" placeholder="Bắt đầu gõ để tính giờ…" style="min-height:96px" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>' +
      '<div class="stat-grid"><div class="stat" style="background:var(--primary-soft)"><div class="stat-label">Tốc độ</div><div class="stat-value" id="wpm">0 WPM</div></div><div class="stat"><div class="stat-label">Độ chính xác</div><div class="stat-value" id="acc">100%</div></div><div class="stat"><div class="stat-label">Thời gian còn</div><div class="stat-value" id="left">60s</div></div><div class="stat"><div class="stat-label">Ký tự đúng</div><div class="stat-value" id="ok">0</div></div></div>' +
      '<div class="notice" id="msg" hidden></div>';
    const inp = U.$(root, '#inp');
    const reset = (newText) => { clearInterval(timer); timer = null; done = false; t0 = 0; if (newText || !target) target = PASSAGES[U.rand(PASSAGES.length)]; inp.value = ''; inp.disabled = false; U.$(root, '#msg').hidden = true; U.$(root, '#left').textContent = dur + 's'; paint(); };
    const stats = () => { const v = inp.value.normalize('NFC'); let ok = 0; for (let i = 0; i < v.length; i++) if (v[i] === target[i]) ok++; const el = t0 ? Math.max(1, (Date.now() - t0) / 1000) : 1; return { v, ok, wpm: t0 ? ok / 5 / (el / 60) : 0, acc: v.length ? ok / v.length * 100 : 100 }; };
    const paint = () => { const s = stats(); let h = '';
      for (let i = 0; i < target.length; i++) { const c = esc(target[i]); if (i < s.v.length) h += '<span class="' + (s.v[i] === target[i] ? 'ok' : 'bad') + '">' + c + '</span>'; else h += i === s.v.length ? '<span class="cur">' + c + '</span>' : c; }
      U.$(root, '#tt').innerHTML = h; U.$(root, '#wpm').textContent = Math.round(s.wpm) + ' WPM'; U.$(root, '#acc').textContent = Math.round(s.acc) + '%'; U.$(root, '#ok').textContent = s.ok; return s; };
    const finish = () => { clearInterval(timer); done = true; inp.disabled = true; const s = paint();
      const lv = s.wpm < 20 ? 'Mới bắt đầu' : s.wpm < 35 ? 'Trung bình' : s.wpm < 55 ? 'Khá nhanh' : 'Rất nhanh';
      const m = U.$(root, '#msg'); m.hidden = false; m.className = 'notice notice-success'; m.innerHTML = '<span>Hoàn thành! <b>' + Math.round(s.wpm) + ' WPM</b>, chính xác ' + Math.round(s.acc) + '% · Trình độ: ' + lv + '. <button class="btn btn-sm" type="button" id="again">Làm lại</button></span>';
      U.$(root, '#again').onclick = () => reset(true); };
    inp.addEventListener('input', () => {
      if (done) return; if (!t0) { t0 = Date.now(); timer = setInterval(() => { const left = Math.max(0, dur - Math.floor((Date.now() - t0) / 1000)); U.$(root, '#left').textContent = left + 's'; paint(); if (!left) finish(); }, 250); }
      const s = paint(); if (s.v.length >= target.length) finish();
    });
    inp.addEventListener('paste', e => { e.preventDefault(); ctx.toast('Hãy gõ thay vì dán nhé'); });
    U.bindChips(root, 'dur', v => { dur = +v; reset(false); });
    U.$(root, '#new').onclick = () => reset(true); ctx.onCleanup(() => clearInterval(timer)); reset(true);
  } });

/* ---------- image tools (resize / compress / convert) ---------- */
function loadImage(file) { return new Promise((res, rej) => { const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => res({ img, url }); img.onerror = () => rej(new Error('Không đọc được ảnh')); img.src = url; }); }
function canvasBlob(img, w, h, type, q, bg) { return new Promise(res => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, w, h); c.toBlob(b => res(b), type, q); }); }
const extOf = t => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[t] || 'png');
function imageTool(kind) {
  return (root, ctx) => {
    const title = { resize: 'Kéo ảnh vào đây để resize', compress: 'Kéo ảnh vào đây để nén', png: 'Kéo ảnh JPG vào đây', jpg: 'Kéo ảnh PNG vào đây' }[kind];
    const accept = kind === 'png' ? 'image/jpeg,image/webp,image/*' : kind === 'jpg' ? 'image/png,image/webp,image/*' : 'image/*';
    root.innerHTML = U.drop('dz', title, accept) + '<div id="work" class="stack" hidden></div>';
    let src = null, file = null, out = null, urls = [];
    const work = U.$(root, '#work');
    U.bindDrop(root, 'dz', async f => {
      if (!/^image\//.test(f.type)) { ctx.toast('Hãy chọn file ảnh (JPG, PNG, WEBP)'); return; }
      try { src = await loadImage(f); file = f; urls.push(src.url); } catch (e) { ctx.toast(e.message); return; }
      U.$(root, '#dz').hidden = true; work.hidden = false; build();
    });
    ctx.onCleanup(() => urls.forEach(u => URL.revokeObjectURL(u)));
    function build() {
      const W = src.img.naturalWidth, H = src.img.naturalHeight;
      let controls = '';
      if (kind === 'resize') controls = '<div class="field"><span class="label">Kích thước nhanh</span>' + U.chips('pre', [['1080x1080', '1080×1080 (Instagram)'], ['1080x1920', '1080×1920 (Story)'], ['1200x630', '1200×630 (Facebook)'], ['1024x1024', '1024×1024'], ['50', '50%']], '') + '</div>' +
        '<div class="form-grid">' + U.num('w', 'Chiều rộng', { unit: 'px', value: String(W), mode: 'numeric' }) + U.num('h', 'Chiều cao', { unit: 'px', value: String(H), mode: 'numeric' }) + '</div><label class="check"><input type="checkbox" id="lock" checked>Giữ tỷ lệ khung hình</label>';
      if (kind === 'compress') controls = '<div class="form-grid">' + U.select('fmt', 'Định dạng đầu ra', [['image/jpeg', 'JPG'], ['image/webp', 'WEBP']], file.type === 'image/webp' ? 'image/webp' : 'image/jpeg') +
        U.num('maxw', 'Chiều rộng tối đa', { unit: 'px', value: String(Math.min(W, 1920)), mode: 'numeric' }) + '</div><div class="field"><label class="label" for="q">Chất lượng: <b id="qv">75</b>%</label><input class="range" type="range" id="q" min="10" max="95" value="75"></div>';
      if (kind === 'jpg') controls = '<div class="form-grid"><div class="field"><label class="label" for="bgc">Màu nền thay cho vùng trong suốt</label><input class="input" type="color" id="bgc" value="#ffffff" style="padding:4px;height:44px"></div></div><div class="field"><label class="label" for="q">Chất lượng: <b id="qv">92</b>%</label><input class="range" type="range" id="q" min="50" max="100" value="92"></div>';
      work.innerHTML = '<img class="img-preview" id="pv" alt="Ảnh xem trước">' + controls +
        '<div class="stat-grid"><div class="stat"><div class="stat-label">Ảnh gốc</div><div class="stat-value" style="font-size:18px">' + U.bytes(file.size) + '</div><div class="stat-label">' + W + '×' + H + ' · ' + extOf(file.type).toUpperCase() + '</div></div>' +
        '<div class="stat" style="background:var(--primary-soft)"><div class="stat-label">Sau xử lý</div><div class="stat-value" style="font-size:18px" id="os">…</div><div class="stat-label" id="od"></div></div>' +
        (kind === 'compress' ? '<div class="stat"><div class="stat-label">Giảm dung lượng</div><div class="stat-value" style="font-size:18px" id="ratio">…</div></div>' : '') + '</div>' +
        '<div class="btn-row"><button class="btn btn-primary btn-lg" type="button" id="dl" style="flex:1">Tải xuống</button><button class="btn btn-lg" type="button" id="other">Chọn ảnh khác</button></div>';
      U.$(work, '#pv').src = src.url;
      if (kind === 'resize') {
        const ratio = W / H, w = U.$(work, '#w'), h = U.$(work, '#h');
        w.addEventListener('input', () => { if (U.$(work, '#lock').checked) h.value = Math.round(TI.parseNum(w.value) / ratio) || ''; process(); });
        h.addEventListener('input', () => { if (U.$(work, '#lock').checked) w.value = Math.round(TI.parseNum(h.value) * ratio) || ''; process(); });
        U.bindChips(work, 'pre', v => { if (v === '50') { w.value = Math.round(W / 2); h.value = Math.round(H / 2); } else { const [a, b] = v.split('x'); w.value = a; h.value = b; U.$(work, '#lock').checked = false; } process(); });
      }
      work.addEventListener('input', e => { if (e.target.id === 'q') U.$(work, '#qv').textContent = e.target.value; if (kind !== 'resize') process(); });
      work.addEventListener('change', e => { if (e.target.matches('select')) process(); });
      U.$(work, '#dl').onclick = () => { if (!out) return; const base = file.name.replace(/\.[^.]+$/, ''); ctx.download(base + (kind === 'resize' ? '-' + out.w + 'x' + out.h : kind === 'compress' ? '-nen' : '') + '.' + extOf(out.blob.type), out.blob); };
      U.$(work, '#other').onclick = () => { work.hidden = true; U.$(root, '#dz').hidden = false; U.$(root, '#dz input').value = ''; };
      process();
    }
    let tm;
    function process() {
      clearTimeout(tm); tm = setTimeout(async () => {
        const W = src.img.naturalWidth, H = src.img.naturalHeight; let w = W, h = H, type = file.type, q, bg = null;
        if (kind === 'resize') { w = Math.max(1, Math.min(10000, Math.round(TI.parseNum(U.$(work, '#w').value)) || W)); h = Math.max(1, Math.min(10000, Math.round(TI.parseNum(U.$(work, '#h').value)) || H)); if (type === 'image/jpeg' || type === 'image/webp') q = 0.92; else type = 'image/png'; }
        if (kind === 'compress') { type = U.$(work, '#fmt').value; q = +U.$(work, '#q').value / 100; const mw = Math.round(TI.parseNum(U.$(work, '#maxw').value)); if (mw && mw < W) { w = mw; h = Math.round(H * mw / W); } bg = '#ffffff'; }
        if (kind === 'png') type = 'image/png';
        if (kind === 'jpg') { type = 'image/jpeg'; q = +U.$(work, '#q').value / 100; bg = U.$(work, '#bgc').value; }
        const blob = await canvasBlob(src.img, w, h, type, q, bg); if (!blob) { ctx.toast('Trình duyệt không hỗ trợ định dạng này'); return; }
        out = { blob, w, h }; const u = URL.createObjectURL(blob); urls.push(u); U.$(work, '#pv').src = u;
        U.$(work, '#os').textContent = U.bytes(blob.size); U.$(work, '#od').textContent = w + '×' + h + ' · ' + extOf(blob.type).toUpperCase();
        if (kind === 'compress') { const r = (1 - blob.size / file.size) * 100; U.$(work, '#ratio').textContent = r > 0 ? '−' + fmt(r, 1) + '%' : 'Không giảm'; }
      }, 120);
    }
  };
}
const imgFaq = [['Ảnh có bị tải lên máy chủ không?', 'Không. Ảnh được xử lý bằng canvas ngay trong trình duyệt của bạn, kể cả ảnh riêng tư.'], ['Hỗ trợ những định dạng nào?', 'JPG, PNG, WEBP và các định dạng trình duyệt đọc được. Ảnh HEIC từ iPhone cần chuyển sang JPG trước.']];
D({ slug: 'resize-anh', name: 'Resize ảnh', cat: 'image', icon: '📏', desc: 'Đổi kích thước ảnh theo pixel hoặc preset Instagram, Facebook, Story', pop: 92, level: 2,
  kw: 'resize image thay doi kich thuoc anh doi size anh thu nho anh phong to 1080x1080 1200x630 instagram', h1: 'Resize ảnh online', imgTool: true,
  aliases: ['resize-anh-1024x1024', 'resize-anh-1080x1080', 'resize-anh-1080x1920', 'resize-anh-1200x630', 'tao-thumbnail', 'kiem-tra-kich-thuoc-anh'], related: ['nen-anh', 'jpg-sang-png', 'png-sang-jpg', 'tao-qr-code'], faq: imgFaq, render: imageTool('resize') });
D({ slug: 'nen-anh', name: 'Nén ảnh', cat: 'image', icon: '🗜️', desc: 'Giảm dung lượng ảnh JPG, PNG, WEBP mà vẫn giữ chất lượng', pop: 91, level: 2,
  kw: 'compress image nen anh giam dung luong anh toi uu anh giam kb anh tinypng', h1: 'Nén ảnh online', seoTitle: 'Nén Ảnh Online – Giảm Dung Lượng JPG, PNG Miễn Phí',
  aliases: ['kiem-tra-dung-luong-anh'], related: ['resize-anh', 'png-sang-jpg', 'jpg-sang-png', 'jpg-sang-webp'], faq: imgFaq, render: imageTool('compress') });
D({ slug: 'jpg-sang-png', name: 'JPG → PNG', cat: 'image', icon: '🖼️', desc: 'Chuyển ảnh JPG, WEBP sang PNG không mất chất lượng', pop: 74, level: 2,
  kw: 'jpg to png chuyen jpg sang png doi duoi anh convert image webp to png', h1: 'Chuyển JPG sang PNG online', related: ['png-sang-jpg', 'nen-anh', 'resize-anh'], faq: imgFaq, render: imageTool('png') });
D({ slug: 'png-sang-jpg', name: 'PNG → JPG', cat: 'image', icon: '🌄', desc: 'Chuyển ảnh PNG, WEBP sang JPG, chọn màu nền cho vùng trong suốt', pop: 75, level: 2,
  kw: 'png to jpg chuyen png sang jpg doi duoi anh convert image webp to jpg', h1: 'Chuyển PNG sang JPG online', aliases: ['webp-sang-jpg'], related: ['jpg-sang-png', 'nen-anh', 'resize-anh'], faq: imgFaq, render: imageTool('jpg') });

/* ---------- developer/json ---------- */
D({ slug: 'json-formatter', name: 'JSON Formatter', cat: 'dev', icon: '{ }', desc: 'Định dạng, kiểm tra lỗi và thu gọn JSON, báo vị trí dòng lỗi', pop: 85,
  kw: 'json formatter beautify validator minify json lint dinh dang json kiem tra json pretty print', h1: 'JSON Formatter & Validator', aliases: ['json-validator', 'json-minifier', 'json-viewer'],
  related: ['ma-hoa-base64', 'uuid-generator', 'csv-sang-json', 'url-encoder'],
  render(root, ctx) {
    root.innerHTML = '<div class="split"><div class="field"><label class="label" for="in">JSON đầu vào</label><textarea class="textarea mono" id="in" rows="14"></textarea></div><div class="field"><span class="label">Kết quả</span><div class="out-box" id="out" style="min-height:300px"></div></div></div>' +
      '<div class="spread"><div class="btn-row"><button class="btn btn-primary" type="button" id="fmt">Định dạng</button><button class="btn" type="button" id="min">Thu gọn</button>' + '<select class="select" id="ind" style="width:auto;min-height:40px" aria-label="Thụt lề"><option value="2">2 dấu cách</option><option value="4">4 dấu cách</option><option value="t">Tab</option></select></div>' +
      '<div class="btn-row"><button class="btn" type="button" id="cp">Sao chép</button><button class="btn" type="button" id="dl">Tải .json</button></div></div><div class="notice" id="st"></div>';
    const inp = U.$(root, '#in'), out = U.$(root, '#out'), st = U.$(root, '#st');
    inp.value = '{"cuaHang":"Tiện Ích Nhanh","sanPham":[{"ten":"Áo thun","gia":199000,"conHang":true},{"ten":"Nón","gia":89000,"conHang":false}],"capNhat":"2026-10-01"}';
    const run = (mode) => {
      const s = inp.value.trim(); if (!s) { out.textContent = ''; st.className = 'notice'; st.textContent = 'Dán JSON vào ô bên trái.'; return; }
      try { const o = JSON.parse(s); const ind = U.$(root, '#ind').value; out.textContent = mode === 'min' ? JSON.stringify(o) : JSON.stringify(o, null, ind === 't' ? '\t' : +ind);
        st.className = 'notice notice-success'; st.textContent = '✓ JSON hợp lệ · ' + fmt(out.textContent.length, 0) + ' ký tự'; inp.classList.remove('is-invalid');
      } catch (e) { const m = /position (\d+)/.exec(e.message); let where = ''; if (m) { const pos = +m[1], pre = s.slice(0, pos); where = ' (dòng ' + (pre.split('\n').length) + ', cột ' + (pos - pre.lastIndexOf('\n')) + ')'; }
        out.textContent = ''; st.className = 'notice notice-danger'; st.textContent = '✗ JSON không hợp lệ' + where + ': ' + e.message; inp.classList.add('is-invalid'); }
    };
    U.$(root, '#fmt').onclick = () => run('fmt'); U.$(root, '#min').onclick = () => run('min'); U.$(root, '#ind').onchange = () => run('fmt');
    inp.addEventListener('input', () => run('fmt'));
    U.$(root, '#cp').onclick = () => out.textContent ? ctx.copy(out.textContent) : ctx.toast('Chưa có kết quả'); U.$(root, '#dl').onclick = () => ctx.download('du-lieu.json', out.textContent || inp.value, 'application/json');
    run('fmt');
  } });

/* ---------- developer/base64 ---------- */
D({ slug: 'ma-hoa-base64', name: 'Base64 Encode / Decode', cat: 'dev', icon: '🔣', desc: 'Mã hóa và giải mã Base64, hỗ trợ tiếng Việt UTF-8 và URL-safe', pop: 72,
  kw: 'base64 encode decode ma hoa giai ma base64 utf8 url safe btoa atob', h1: 'Mã hóa / giải mã Base64', aliases: ['base64-encode', 'base64-decode', 'base64-encoder', 'base64-decoder'],
  related: ['json-formatter', 'url-encoder', 'uuid-generator', 'tao-mat-khau'],
  render(root, ctx) {
    let mode = 'enc';
    root.innerHTML = U.tabs('mode', [['enc', 'Mã hóa'], ['dec', 'Giải mã']], mode) + '<div class="split"><div class="field"><label class="label" for="in" id="inl">Văn bản</label><textarea class="textarea mono" id="in" rows="8">Xin chào, Tiện Ích Nhanh!</textarea></div><div class="field"><span class="label" id="outl">Base64</span><div class="out-box" id="out"></div></div></div>' +
      '<div class="spread"><label class="check"><input type="checkbox" id="url">URL-safe (- và _ thay cho + và /)</label><div class="btn-row"><button class="btn" type="button" id="sw">⇄ Đảo chiều</button><button class="btn btn-primary" type="button" id="cp">Sao chép</button></div></div><div class="notice notice-danger" id="err" hidden></div>';
    const enc = s => { const b = new TextEncoder().encode(s); let bin = ''; b.forEach(x => bin += String.fromCharCode(x)); let r = btoa(bin); if (U.$(root, '#url').checked) r = r.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); return r; };
    const dec = s => { s = s.trim().replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''); while (s.length % 4) s += '='; const bin = atob(s); return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, c => c.charCodeAt(0))); };
    const run = () => { const v = U.$(root, '#in').value; U.$(root, '#err').hidden = true; try { U.$(root, '#out').textContent = v ? (mode === 'enc' ? enc(v) : dec(v)) : ''; } catch (e) { U.$(root, '#out').textContent = ''; U.$(root, '#err').hidden = false; U.$(root, '#err').textContent = 'Chuỗi Base64 không hợp lệ hoặc không phải văn bản UTF-8.'; } };
    const labels = () => { U.$(root, '#inl').textContent = mode === 'enc' ? 'Văn bản' : 'Chuỗi Base64'; U.$(root, '#outl').textContent = mode === 'enc' ? 'Base64' : 'Văn bản'; };
    U.bindTabs(root, 'mode', v => { mode = v; labels(); run(); });
    U.$(root, '#sw').onclick = () => { const o = U.$(root, '#out').textContent; mode = mode === 'enc' ? 'dec' : 'enc'; U.$$(root, '#mode .tab').forEach(t => t.setAttribute('aria-selected', t.dataset.v === mode)); U.$(root, '#in').value = o; labels(); run(); };
    root.addEventListener('input', run); root.addEventListener('change', run); U.$(root, '#cp').onclick = () => U.$(root, '#out').textContent ? ctx.copy(U.$(root, '#out').textContent) : ctx.toast('Chưa có kết quả'); run();
  } });

/* ---------- developer/uuid ---------- */
D({ slug: 'uuid-generator', name: 'UUID Generator', cat: 'dev', icon: '🆔', desc: 'Tạo UUID v4 ngẫu nhiên, hàng loạt, chữ hoa hoặc không gạch nối', pop: 64,
  kw: 'uuid generator guid v4 random id tao uuid ma dinh danh', h1: 'Tạo UUID v4 online', related: ['tao-mat-khau', 'ma-hoa-base64', 'json-formatter', 'hash-generator'],
  render(root, ctx) {
    root.innerHTML = '<div class="form-grid">' + U.num('n', 'Số lượng', { value: '5', mode: 'numeric' }) + '</div><div class="row"><label class="check"><input type="checkbox" id="up">Chữ hoa</label><label class="check"><input type="checkbox" id="nh">Bỏ dấu gạch nối</label><label class="check"><input type="checkbox" id="br">Thêm ngoặc {}</label></div>' +
      '<button class="btn btn-primary btn-lg btn-block" type="button" id="go">Tạo UUID</button><div class="out-box" id="out"></div><div class="btn-row"><button class="btn" type="button" id="cp">Sao chép tất cả</button><button class="btn" type="button" id="dl">Tải .txt</button></div>';
    const uuid = () => { if (crypto.randomUUID) return crypto.randomUUID(); const b = crypto.getRandomValues(new Uint8Array(16)); b[6] = b[6] & 15 | 64; b[8] = b[8] & 63 | 128; const h = [...b].map(x => x.toString(16).padStart(2, '0')).join(''); return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20); };
    const go = () => { const n = Math.max(1, Math.min(1000, Math.round(U.val(root, 'n')) || 1)); U.$(root, '#out').textContent = Array.from({ length: n }, () => { let u = uuid(); if (U.$(root, '#nh').checked) u = u.replace(/-/g, ''); if (U.$(root, '#up').checked) u = u.toUpperCase(); if (U.$(root, '#br').checked) u = '{' + u + '}'; return u; }).join('\n'); };
    U.$(root, '#go').onclick = go; root.addEventListener('change', go); U.$(root, '#cp').onclick = () => ctx.copy(U.$(root, '#out').textContent); U.$(root, '#dl').onclick = () => ctx.download('uuid.txt', U.$(root, '#out').textContent); go();
  } });

/* ---------- design/color ---------- */
const hexToRgb = h => { h = h.replace('#', '').trim(); if (h.length === 3) h = h.split('').map(c => c + c).join(''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('').toUpperCase();
const rgbToHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]; };
const hslToRgb = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round); };
const lum = ([r, g, b]) => { const c = [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
D({ slug: 'color-picker', name: 'Color Picker', cat: 'design', icon: '🎨', isNew: true, desc: 'Chọn màu, lấy mã HEX, RGB, HSL và bảng sắc độ đậm nhạt', pop: 68,
  kw: 'color picker chon mau ma mau hex rgb hsl bang mau palette sac do eyedropper', h1: 'Chọn màu & lấy mã màu online', aliases: ['color-palette-generator', 'color-converter', 'contrast-checker', 'wcag-contrast-checker'],
  related: ['hex-sang-rgb', 'tao-qr-code', 'css-gradient-generator', 'resize-anh'],
  render(root, ctx) {
    root.innerHTML = '<div class="split"><div class="stack"><div class="color-big" id="big"></div><div class="row"><input type="color" id="pick" value="#2563eb" style="width:56px;height:44px;border:1px solid var(--border-control);border-radius:10px;padding:2px;background:var(--surface)" aria-label="Bảng chọn màu"><input class="input mono" id="hex" value="#2563EB" style="flex:1;min-width:0" aria-label="Mã HEX"></div></div>' +
      '<div class="stack" id="codes"></div></div><div class="field"><span class="label">Sắc độ (bấm để chọn)</span><div class="swatch-row" id="tints"></div></div>';
    const set = (hex, from) => { const rgb = hexToRgb(hex); if (!rgb) return; const H = rgbToHex(...rgb), hsl = rgbToHsl(...rgb);
      U.$(root, '#big').style.background = H; if (from !== 'pick') U.$(root, '#pick').value = H.toLowerCase(); if (from !== 'hex') U.$(root, '#hex').value = H;
      const cW = contrast(rgb, [255, 255, 255]), cB = contrast(rgb, [0, 0, 0]);
      const codes = [['HEX', H], ['RGB', 'rgb(' + rgb.join(', ') + ')'], ['HSL', 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)'], ['CSS biến', '--color: ' + H + ';']];
      U.$(root, '#codes').innerHTML = codes.map(([k, v]) => '<div class="row" style="flex-wrap:nowrap"><span class="t-caption" style="width:72px">' + k + '</span><code class="mono" style="flex:1;min-width:0;overflow-wrap:anywhere">' + esc(v) + '</code><button class="btn btn-sm" type="button" data-c="' + esc(v) + '">Sao chép</button></div>').join('') +
        '<div class="notice">Tương phản với chữ trắng <b>&nbsp;' + fmt(cW, 2) + ':1&nbsp;</b>' + (cW >= 4.5 ? '✓' : '✗') + ' · với chữ đen <b>&nbsp;' + fmt(cB, 2) + ':1&nbsp;</b>' + (cB >= 4.5 ? '✓' : '✗') + '</div>';
      U.$(root, '#tints').innerHTML = [95, 85, 72, 60, 50, 40, 30, 20, 12].map(l => { const c = rgbToHex(...hslToRgb(hsl[0], hsl[1], l)); return '<button type="button" class="swatch" data-h="' + c + '" style="background:' + c + ';color:' + (l > 55 ? '#111827' : '#ffffff') + '">' + c + '</button>'; }).join(''); };
    U.$(root, '#pick').addEventListener('input', e => set(e.target.value, 'pick')); U.$(root, '#hex').addEventListener('input', e => set(e.target.value, 'hex'));
    root.addEventListener('click', e => { const c = e.target.closest('[data-c]'); if (c) ctx.copy(c.dataset.c); const s = e.target.closest('[data-h]'); if (s) set(s.dataset.h); });
    set('#2563EB');
  } });
D({ slug: 'hex-sang-rgb', name: 'HEX → RGB', cat: 'design', icon: '🌈', desc: 'Chuyển mã màu HEX sang RGB, HSL và ngược lại', pop: 62,
  kw: 'hex to rgb chuyen ma mau hex sang rgb rgb to hex hsl color code converter', h1: 'Chuyển HEX sang RGB', aliases: ['rgb-sang-hex', 'rgb-sang-hsl', 'hsl-sang-rgb', 'hex-sang-hsl'],
  related: ['color-picker', 'css-gradient-generator', 'chuyen-doi-don-vi'],
  render(root, ctx) {
    root.innerHTML = '<div class="form-grid"><div class="field"><label class="label" for="hex">Mã HEX</label><input class="input mono" id="hex" value="#F59E0B"></div>' + U.num('r', 'R (0–255)', { value: '245', mode: 'numeric' }) + U.num('g', 'G (0–255)', { value: '158', mode: 'numeric' }) + U.num('b', 'B (0–255)', { value: '11', mode: 'numeric' }) + '</div>' +
      '<div class="row" style="flex-wrap:nowrap"><div id="sw" style="width:72px;height:72px;border-radius:14px;border:1px solid var(--border);flex:none"></div><div style="flex:1;min-width:0">' + U.result('res', 'RGB') + '</div></div>';
    const show = rgb => { U.$(root, '#sw').style.background = rgbToHex(...rgb); const hsl = rgbToHsl(...rgb); U.setResult(root, 'res', { value: 'rgb(' + rgb.join(', ') + ')', formula: rgbToHex(...rgb) + ' · hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)' }); };
    U.$(root, '#hex').addEventListener('input', e => { const rgb = hexToRgb(e.target.value); if (!rgb) return; ['r', 'g', 'b'].forEach((k, i) => U.$(root, '#' + k).value = rgb[i]); show(rgb); });
    ['r', 'g', 'b'].forEach(k => U.$(root, '#' + k).addEventListener('input', () => { const rgb = ['r', 'g', 'b'].map(x => Math.max(0, Math.min(255, Math.round(U.val(root, x)) || 0))); U.$(root, '#hex').value = rgbToHex(...rgb); show(rgb); }));
    U.bindCopy(root, ctx); show([245, 158, 11]);
  } });

/* ---------- datetime/pomodoro ---------- */
D({ slug: 'pomodoro', name: 'Pomodoro Timer', cat: 'datetime', icon: '🍅', desc: 'Hẹn giờ Pomodoro 25/5 phút giúp tập trung học và làm việc', pop: 77, isNew: true,
  kw: 'pomodoro timer hen gio tap trung 25 phut hoc tap lam viec focus timer', h1: 'Pomodoro Timer online', aliases: ['pomodoro-timer', 'pomodoro-hoc-tap', 'meeting-timer'],
  related: ['dem-nguoc', 'bam-gio', 'kiem-tra-toc-do-go-phim'],
  render(root, ctx) {
    const cfg = ctx.state({ work: 25, short: 5, long: 15, done: 0 });
    let mode = 'work', left = cfg.work * 60, total = left, iv = null, end = 0;
    const C = 2 * Math.PI * 130;
    root.innerHTML = U.tabs('mode', [['work', 'Tập trung'], ['short', 'Nghỉ ngắn'], ['long', 'Nghỉ dài']], mode) +
      '<div class="ring"><svg viewBox="0 0 280 280"><circle class="track" cx="140" cy="140" r="130" fill="none" stroke-width="12"/><circle class="bar" id="bar" cx="140" cy="140" r="130" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="0"/></svg><div style="text-align:center"><div class="timer-face" id="face">25:00</div><div class="t-small muted" id="lbl">Phiên tập trung</div></div></div>' +
      '<div class="btn-row" style="justify-content:center"><button class="btn btn-primary btn-lg" type="button" id="ss" style="min-width:160px">Bắt đầu</button><button class="btn btn-lg" type="button" id="rs">Đặt lại</button><button class="btn btn-lg" type="button" id="sk">Bỏ qua</button></div>' +
      '<div class="spread"><span class="t-small">Đã hoàn thành hôm nay: <b id="cnt">0</b> 🍅</span></div>' +
      '<details><summary style="cursor:pointer;font-weight:600">Tùy chỉnh thời lượng</summary><div class="form-grid" style="margin-top:12px">' + U.num('cw', 'Tập trung', { unit: 'phút', value: String(cfg.work), mode: 'numeric' }) + U.num('cs', 'Nghỉ ngắn', { unit: 'phút', value: String(cfg.short), mode: 'numeric' }) + U.num('cl', 'Nghỉ dài', { unit: 'phút', value: String(cfg.long), mode: 'numeric' }) + '</div></details>';
    const title0 = document.title, mm = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    const paint = () => { U.$(root, '#face').textContent = mm(left); U.$(root, '#bar').setAttribute('stroke-dashoffset', C * (1 - left / total)); U.$(root, '#cnt').textContent = cfg.done; if (iv) document.title = mm(left) + ' · Pomodoro'; };
    const setMode = m => { stop(); mode = m; left = total = cfg[m] * 60; U.$$(root, '#mode .tab').forEach(t => t.setAttribute('aria-selected', t.dataset.v === m)); U.$(root, '#lbl').textContent = { work: 'Phiên tập trung', short: 'Nghỉ ngắn', long: 'Nghỉ dài' }[m]; paint(); };
    const stop = () => { clearInterval(iv); iv = null; U.$(root, '#ss').textContent = 'Bắt đầu'; document.title = title0; };
    const start = () => { end = Date.now() + left * 1000; iv = setInterval(() => { left = Math.max(0, Math.round((end - Date.now()) / 1000)); paint(); if (!left) { U.alarm(); if (mode === 'work') { cfg.done++; ctx.save(cfg); setMode(cfg.done % 4 === 0 ? 'long' : 'short'); } else setMode('work'); ctx.toast('Hết giờ! Chuyển sang ' + U.$(root, '#lbl').textContent.toLowerCase()); } }, 250); U.$(root, '#ss').textContent = 'Tạm dừng'; };
    U.$(root, '#ss').onclick = () => iv ? stop() : start(); U.$(root, '#rs').onclick = () => setMode(mode); U.$(root, '#sk').onclick = () => setMode(mode === 'work' ? 'short' : 'work');
    U.bindTabs(root, 'mode', v => setMode(v));
    root.addEventListener('input', e => { if (!/^c[wsl]$/.test(e.target.id)) return; cfg.work = Math.max(1, U.val(root, 'cw') || 25); cfg.short = Math.max(1, U.val(root, 'cs') || 5); cfg.long = Math.max(1, U.val(root, 'cl') || 15); ctx.save(cfg); if (!iv) setMode(mode); });
    ctx.onCleanup(() => { clearInterval(iv); document.title = title0; }); setMode('work');
  } });

/* ---------- datetime/stopwatch ---------- */
D({ slug: 'bam-gio', name: 'Bấm giờ (Stopwatch)', cat: 'datetime', icon: '⏱️', isNew: true, desc: 'Đồng hồ bấm giờ online chính xác đến 1/100 giây, ghi vòng', pop: 69,
  kw: 'stopwatch dong ho bam gio bam thoi gian lap timer chay bo', h1: 'Đồng hồ bấm giờ online', aliases: ['stopwatch'], related: ['dem-nguoc', 'pomodoro', 'kiem-tra-toc-do-go-phim'],
  render(root, ctx) {
    let acc = 0, t0 = 0, raf = null; const laps = [];
    root.innerHTML = '<div class="timer-face" id="face">00:00.00</div><div class="btn-row" style="justify-content:center"><button class="btn btn-primary btn-lg" type="button" id="ss" style="min-width:150px">Bắt đầu</button><button class="btn btn-lg" type="button" id="lap" disabled>Vòng</button><button class="btn btn-lg" type="button" id="rs">Đặt lại</button></div>' +
      '<div class="spread"><span class="t-caption">Các vòng</span><button class="btn btn-sm btn-ghost" type="button" id="cp">Sao chép</button></div><ul class="history" id="laps"></ul>';
    const f = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, c = Math.floor(ms / 10) % 100; return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(c).padStart(2, '0'); };
    const now = () => acc + (t0 ? performance.now() - t0 : 0);
    const tick = () => { U.$(root, '#face').textContent = f(now()); raf = requestAnimationFrame(tick); };
    const paintLaps = () => { U.$(root, '#laps').innerHTML = laps.length ? laps.map((l, i) => '<li><span>Vòng ' + (laps.length - i) + ' · +' + f(l[1]) + '</span><span>' + f(l[0]) + '</span></li>').join('') : '<li><span class="muted">Bấm “Vòng” khi đồng hồ đang chạy</span><span></span></li>'; };
    U.$(root, '#ss').onclick = () => { if (t0) { acc = now(); t0 = 0; cancelAnimationFrame(raf); U.$(root, '#ss').textContent = 'Tiếp tục'; U.$(root, '#lap').disabled = true; } else { t0 = performance.now(); tick(); U.$(root, '#ss').textContent = 'Tạm dừng'; U.$(root, '#lap').disabled = false; } };
    U.$(root, '#lap').onclick = () => { const n = now(); laps.unshift([n, n - (laps[0] ? laps[0][0] : 0)]); paintLaps(); };
    U.$(root, '#rs').onclick = () => { acc = 0; t0 = 0; cancelAnimationFrame(raf); laps.length = 0; U.$(root, '#face').textContent = f(0); U.$(root, '#ss').textContent = 'Bắt đầu'; U.$(root, '#lap').disabled = true; paintLaps(); };
    U.$(root, '#cp').onclick = () => laps.length ? ctx.copy(laps.slice().reverse().map((l, i) => 'Vòng ' + (i + 1) + ': ' + f(l[0]) + ' (+' + f(l[1]) + ')').join('\n')) : ctx.toast('Chưa có vòng nào');
    ctx.onCleanup(() => cancelAnimationFrame(raf)); paintLaps();
  } });

/* ---------- datetime/countdown ---------- */
D({ slug: 'dem-nguoc', name: 'Đếm ngược thời gian', cat: 'datetime', icon: '⏳', desc: 'Hẹn giờ đếm ngược có chuông báo, preset 1–30 phút', pop: 73,
  kw: 'countdown timer dem nguoc hen gio bao thuc timer phut giay', h1: 'Đồng hồ đếm ngược online', aliases: ['countdown-timer', 'dem-nguoc-gio', 'alarm-online'], related: ['bam-gio', 'pomodoro', 'tinh-ngay'],
  render(root, ctx) {
    let left = 300, iv = null, end = 0;
    root.innerHTML = '<div class="chips" id="pre">' + [1, 3, 5, 10, 15, 30].map(m => '<button class="chip" type="button" data-m="' + m + '">' + m + ' phút</button>').join('') + '</div>' +
      '<div class="form-grid">' + U.num('h', 'Giờ', { value: '0', mode: 'numeric' }) + U.num('m', 'Phút', { value: '5', mode: 'numeric' }) + U.num('s', 'Giây', { value: '0', mode: 'numeric' }) + '</div>' +
      '<div class="timer-face" id="face">05:00</div><div class="progress"><span id="bar" style="width:100%"></span></div>' +
      '<div class="btn-row" style="justify-content:center"><button class="btn btn-primary btn-lg" type="button" id="ss" style="min-width:150px">Bắt đầu</button><button class="btn btn-lg" type="button" id="rs">Đặt lại</button></div>';
    const f = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
    const set = () => Math.max(0, (U.val(root, 'h') || 0) * 3600 + (U.val(root, 'm') || 0) * 60 + (U.val(root, 's') || 0)) | 0;
    let total = set();
    const paint = () => { U.$(root, '#face').textContent = f(left); U.$(root, '#bar').style.width = (total ? left / total * 100 : 0) + '%'; };
    const stop = () => { clearInterval(iv); iv = null; U.$(root, '#ss').textContent = 'Bắt đầu'; };
    U.$(root, '#ss').onclick = () => { if (iv) { stop(); U.$(root, '#ss').textContent = 'Tiếp tục'; return; } if (!left) { left = total = set(); } if (!left) return ctx.toast('Đặt thời gian trước');
      end = Date.now() + left * 1000; iv = setInterval(() => { left = Math.max(0, Math.round((end - Date.now()) / 1000)); paint(); if (!left) { stop(); U.alarm(); setTimeout(U.alarm, 900); ctx.toast('⏰ Hết giờ!'); } }, 200); U.$(root, '#ss').textContent = 'Tạm dừng'; };
    U.$(root, '#rs').onclick = () => { stop(); left = total = set(); paint(); };
    U.$(root, '#pre').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; U.$(root, '#h').value = 0; U.$(root, '#m').value = b.dataset.m; U.$(root, '#s').value = 0; stop(); left = total = set(); paint(); });
    root.addEventListener('input', () => { if (!iv) { left = total = set(); paint(); } });
    ctx.onCleanup(() => clearInterval(iv)); left = total; paint();
  } });
})();
