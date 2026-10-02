/* Modules: tools/random/*, tools/wheel/*, tools/team/* */
(function () {
const TI = window.TI, U = TI.ui, D = TI.define, esc = TI.esc, fmt = TI.fmt;
const SAMPLE = 'Nguyễn Văn An\nTrần Thị Bình\nLê Minh Châu\nPhạm Quốc Dũng\nHoàng Thu Hà\nVũ Đức Khang\nĐặng Ngọc Lan\nBùi Thanh Long';
function historyList(items) { return items.length ? items.map(([v, t]) => '<li><span>' + esc(v) + '</span><span>' + t + '</span></li>').join('') : '<li><span class="muted">Chưa có lần nào</span><span></span></li>'; }

/* ---------- random/number ---------- */
D({ slug: 'random-so', name: 'Random số', cat: 'random', icon: '🔢', desc: 'Quay số ngẫu nhiên trong khoảng, nhiều số, không trùng', pop: 85,
  kw: 'random number generator quay so ngau nhien boc so so may man rng quay so trung thuong', h1: 'Random số ngẫu nhiên', aliases: ['boc-so', 'random-so-may-man'],
  related: ['quay-random', 'vong-quay-may-man', 'boc-tham', 'tung-xuc-xac', 'random-ten'],
  render(root, ctx) {
    const hist = [];
    root.innerHTML = '<div class="form-grid">' + U.num('min', 'Từ', { value: '1', mode: 'numeric' }) + U.num('max', 'Đến', { value: '100', mode: 'numeric' }) + U.num('n', 'Số lượng', { value: '1', mode: 'numeric' }) + '</div>' +
      '<div class="row"><label class="check"><input type="checkbox" id="uniq" checked>Không trùng lặp</label><label class="check"><input type="checkbox" id="sort">Sắp xếp tăng dần</label></div>' +
      '<div class="big-result"><div class="v" id="out">?</div></div><button class="btn btn-primary btn-lg btn-block" type="button" id="go">🎲 QUAY SỐ</button>' +
      '<div class="spread"><span class="t-caption">Lịch sử</span><div class="btn-row"><button class="btn btn-sm" type="button" id="cp">Sao chép</button><button class="btn btn-sm btn-ghost" type="button" id="clr">Xóa lịch sử</button></div></div><ul class="history" id="hist"></ul>';
    const out = U.$(root, '#out'); let last = '';
    U.$(root, '#hist').innerHTML = historyList(hist);
    U.$(root, '#go').onclick = () => {
      let a = Math.round(U.val(root, 'min')), b = Math.round(U.val(root, 'max')), n = Math.max(1, Math.min(1000, Math.round(U.val(root, 'n')) || 1));
      if (isNaN(a) || isNaN(b)) { ctx.toast('Nhập khoảng số hợp lệ'); return; } if (a > b) [a, b] = [b, a];
      const uniq = U.$(root, '#uniq').checked; if (uniq && n > b - a + 1) { ctx.toast('Khoảng số chỉ có ' + (b - a + 1) + ' giá trị'); return; }
      let res = [];
      if (uniq) { const s = new Set(); while (s.size < n) s.add(a + U.rand(b - a + 1)); res = [...s]; } else for (let i = 0; i < n; i++) res.push(a + U.rand(b - a + 1));
      if (U.$(root, '#sort').checked) res.sort((x, y) => x - y);
      let k = 0; out.classList.add('rolling'); out.classList.remove('pop');
      const iv = setInterval(() => { out.textContent = a + U.rand(b - a + 1); if (++k > 12) { clearInterval(iv); last = res.join(', '); out.textContent = last; out.classList.remove('rolling'); out.classList.add('pop'); hist.unshift([last, U.time()]); U.$(root, '#hist').innerHTML = historyList(hist); } }, 45);
    };
    U.$(root, '#cp').onclick = () => last ? ctx.copy(last) : ctx.toast('Chưa có kết quả');
    U.$(root, '#clr').onclick = () => { hist.length = 0; U.$(root, '#hist').innerHTML = historyList(hist); };
  } });

/* ---------- random/name ---------- */
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Trịnh', 'Mai', 'Tạ'];
const DEM = { m: ['Văn', 'Minh', 'Quốc', 'Đức', 'Hoàng', 'Thanh', 'Gia', 'Anh', 'Hữu', 'Công', 'Bảo', 'Nhật'], f: ['Thị', 'Ngọc', 'Thu', 'Thanh', 'Bảo', 'Minh', 'Phương', 'Khánh', 'Mỹ', 'Diệu', 'Hải', 'Quỳnh'] };
const TEN = { m: ['An', 'Bình', 'Dũng', 'Khang', 'Long', 'Phúc', 'Quân', 'Sơn', 'Tuấn', 'Huy', 'Nam', 'Khoa', 'Đạt', 'Hiếu', 'Kiên', 'Trung', 'Vinh', 'Tài', 'Thịnh', 'Lâm'], f: ['Anh', 'Châu', 'Hà', 'Lan', 'Linh', 'Mai', 'Ngân', 'Nhi', 'Thảo', 'Trang', 'Vy', 'Yến', 'Hương', 'Hạnh', 'Trâm', 'My', 'Quyên', 'Tâm', 'Uyên', 'Giang'] };
D({ slug: 'random-ten', name: 'Random tên', cat: 'random', icon: '🪪', desc: 'Tạo tên tiếng Việt ngẫu nhiên cho nhân vật, dữ liệu mẫu, tài khoản thử', pop: 60,
  kw: 'random name generator ten ngau nhien tao ten tieng viet ho ten nam nu dat ten', h1: 'Tạo tên tiếng Việt ngẫu nhiên', related: ['quay-random', 'random-so', 'chia-doi', 'tao-mat-khau'],
  render(root, ctx) {
    root.innerHTML = '<div class="form-grid">' + U.select('g', 'Giới tính', [['all', 'Ngẫu nhiên'], ['m', 'Nam'], ['f', 'Nữ']], 'all') + U.num('n', 'Số lượng', { value: '10', mode: 'numeric' }) + '</div>' +
      '<button class="btn btn-primary btn-lg btn-block" type="button" id="go">🎲 TẠO TÊN</button><div class="out-box" id="out" style="font-family:var(--font-sans);font-size:16px;line-height:1.8"></div>' +
      '<div class="btn-row"><button class="btn" type="button" id="cp">Sao chép danh sách</button><button class="btn" type="button" id="dl">Tải .txt</button></div>';
    const gen = () => { const g0 = U.$(root, '#g').value, n = Math.max(1, Math.min(500, Math.round(U.val(root, 'n')) || 10)); const out = [];
      for (let i = 0; i < n; i++) { const g = g0 === 'all' ? (U.rand(2) ? 'm' : 'f') : g0; out.push(HO[U.rand(HO.length)] + ' ' + DEM[g][U.rand(DEM[g].length)] + ' ' + TEN[g][U.rand(TEN[g].length)]); }
      U.$(root, '#out').textContent = out.join('\n'); };
    U.$(root, '#go').onclick = gen; U.$(root, '#cp').onclick = () => ctx.copy(U.$(root, '#out').textContent); U.$(root, '#dl').onclick = () => ctx.download('ten-ngau-nhien.txt', U.$(root, '#out').textContent); gen();
  } });

/* ---------- random/picker ---------- */
D({ slug: 'quay-random', name: 'Quay random', cat: 'random', icon: '🎯', desc: 'Chọn ngẫu nhiên một người hoặc một mục từ danh sách', pop: 95,
  kw: 'random picker chon ngau nhien quay random boc ten chon nguoi random name picker quay so chon nguoi thuyet trinh', h1: 'Quay random – chọn ngẫu nhiên từ danh sách',
  seoTitle: 'Quay Random Online – Chọn Ngẫu Nhiên Từ Danh Sách Miễn Phí', aliases: ['boc-ten', 'random-nguoi-thuyet-trinh', 'random-nguoi-truc', 'random-nguoi-tra-tien', 'chon-nguoi-thuyet-trinh', 'random-presenter', 'chon-nguoi-truc', 'chon-nguoi-rua-bat', 'random-thu-tu'],
  related: ['vong-quay-may-man', 'boc-tham', 'tung-xuc-xac', 'tung-dong-xu', 'chia-doi'],
  faq: [['Kết quả có thật sự ngẫu nhiên không?', 'Có. Công cụ dùng bộ sinh số ngẫu nhiên mật mã của trình duyệt (crypto.getRandomValues), mỗi mục có xác suất như nhau.'], ['Có thể loại người đã trúng không?', 'Bật “Loại mục đã trúng” để mỗi người chỉ được chọn một lần.']],
  render(root, ctx) {
    const st = ctx.state({ list: SAMPLE }); const hist = [];
    root.innerHTML = '<div class="split wide-left"><div class="stack"><div class="big-result" style="min-height:180px"><div class="v" id="out">Sẵn sàng</div></div>' +
      '<button class="btn btn-primary btn-lg btn-block" type="button" id="go">🎲 QUAY RANDOM</button><div class="row"><label class="check"><input type="checkbox" id="rm">Loại mục đã trúng</label><button class="btn btn-sm btn-ghost" type="button" id="reset">Khôi phục danh sách</button></div></div>' +
      '<div class="stack"><div class="field"><label class="label" for="list">Danh sách (mỗi dòng một mục)</label><textarea class="textarea" id="list" rows="9"></textarea><span class="hint" id="cnt"></span></div></div></div>' +
      '<div class="spread"><span class="t-caption">Lịch sử kết quả</span><button class="btn btn-sm btn-ghost" type="button" id="clr">Xóa kết quả</button></div><ul class="history" id="hist"></ul>';
    const ta = U.$(root, '#list'), out = U.$(root, '#out'); ta.value = st.list; let original = st.list, busy = false;
    const cnt = () => { U.$(root, '#cnt').textContent = U.lines(ta.value).length + ' mục'; ctx.save({ list: ta.value }); };
    ta.addEventListener('input', () => { original = ta.value; cnt(); }); cnt(); U.$(root, '#hist').innerHTML = historyList(hist);
    U.$(root, '#go').onclick = () => {
      if (busy) return; const items = U.lines(ta.value); if (items.length < 1) { ctx.toast('Danh sách đang trống'); return; }
      busy = true; const win = U.rand(items.length); let k = 0, delay = 40; out.classList.add('rolling'); out.classList.remove('pop');
      const tick = () => { out.textContent = items[U.rand(items.length)]; k++; delay *= 1.12;
        if (k < 18) setTimeout(tick, delay); else { out.textContent = items[win]; out.classList.remove('rolling'); out.classList.add('pop'); busy = false; hist.unshift([items[win], U.time()]); U.$(root, '#hist').innerHTML = historyList(hist);
          if (U.$(root, '#rm').checked) { items.splice(win, 1); ta.value = items.join('\n'); cnt(); } } };
      tick();
    };
    U.$(root, '#reset').onclick = () => { ta.value = original; cnt(); };
    U.$(root, '#clr').onclick = () => { hist.length = 0; U.$(root, '#hist').innerHTML = historyList(hist); out.textContent = 'Sẵn sàng'; };
  } });

/* ---------- wheel/spinner ---------- */
D({ slug: 'vong-quay-may-man', name: 'Vòng quay may mắn', cat: 'wheel', icon: '🎡', desc: 'Vòng quay ngẫu nhiên có âm thanh, lịch sử, loại người đã trúng', pop: 94,
  kw: 'wheel spinner vong quay may man quay thuong spin the wheel random wheel quay so trung thuong vong quay', h1: 'Vòng quay may mắn online',
  seoTitle: 'Vòng Quay May Mắn Online – Quay Random Có Âm Thanh, Miễn Phí', 
  related: ['quay-random', 'boc-tham', 'random-so', 'chia-doi', 'tung-dong-xu'],
  faq: [['Làm sao thêm lựa chọn vào vòng quay?', 'Nhập mỗi lựa chọn một dòng ở ô bên cạnh, hoặc bấm “Nhập file” để tải danh sách .txt/.csv.'], ['Có thể loại người đã trúng không?', 'Sau mỗi lượt quay, bấm “Loại khỏi vòng quay” hoặc bật tự động loại.']],
  render(root, ctx) {
    const st = ctx.state({ list: 'Áo thun\nVoucher 50K\nChúc may mắn lần sau\nTai nghe\nVoucher 100K\nBình giữ nhiệt\nQuay thêm lượt\nSổ tay', sound: true });
    const hist = [];
    root.innerHTML = '<div class="split wide-left"><div class="stack"><div class="wheel-wrap"><canvas id="cv" width="880" height="880" aria-label="Vòng quay"></canvas><div class="wheel-pointer"></div><button class="wheel-hub" type="button" id="hub">QUAY</button></div>' +
      '<button class="btn btn-primary btn-lg btn-block" type="button" id="go">QUAY</button><div class="big-result" style="min-height:90px" hidden id="resbox"><div><div class="t-caption">Kết quả</div><div class="v" id="out" style="font-size:clamp(26px,6vw,40px)"></div><div class="btn-row" style="justify-content:center;margin-top:8px"><button class="btn btn-sm" type="button" id="rmwin">Loại khỏi vòng quay</button><button class="btn btn-sm btn-ghost" type="button" id="cpwin">Sao chép</button></div></div></div></div>' +
      '<div class="stack"><div class="field"><label class="label" for="list">Lựa chọn (mỗi dòng một mục)</label><textarea class="textarea" id="list" rows="10"></textarea><span class="hint" id="cnt"></span></div>' +
      '<div class="row"><input class="input" id="add" placeholder="Thêm lựa chọn…" style="flex:1;min-width:0"><button class="btn" type="button" id="addb">Thêm</button></div>' +
      '<div class="btn-row"><button class="btn btn-sm" type="button" id="shuf">Xáo trộn</button><label class="btn btn-sm" style="cursor:pointer">Nhập file<input type="file" id="imp" accept=".txt,.csv" hidden></label><button class="btn btn-sm" type="button" id="exp">Xuất danh sách</button></div>' +
      '<label class="check"><input type="checkbox" id="auto">Tự động loại mục đã trúng</label><label class="check"><input type="checkbox" id="snd"' + (st.sound ? ' checked' : '') + '>Âm thanh</label></div></div>' +
      '<div class="spread"><span class="t-caption">Lịch sử kết quả</span><button class="btn btn-sm btn-ghost" type="button" id="clr">Xóa lịch sử</button></div><ul class="history" id="hist"></ul>';
    const cv = U.$(root, '#cv'), g = cv.getContext('2d'), ta = U.$(root, '#list'); ta.value = st.list;
    let rot = 0, spinning = false, lastWin = null, raf;
    const palette = () => ['--acc-blue-fg', '--acc-teal-fg', '--acc-amber-fg', '--acc-violet-fg', '--acc-rose-fg', '--acc-green-fg', '--primary', '--acc-slate-fg'].map(U.cssVar);
    const items = () => U.lines(ta.value);
    function draw() {
      const it = items(), n = Math.max(1, it.length), W = cv.width, R = W / 2 - 8, cols = palette(), seg = Math.PI * 2 / n;
      g.clearRect(0, 0, W, W); g.save(); g.translate(W / 2, W / 2); g.rotate(rot);
      for (let i = 0; i < n; i++) {
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, i * seg, (i + 1) * seg); g.closePath();
        g.fillStyle = it.length ? cols[i % cols.length] : U.cssVar('--surface-sunken'); if (it.length && n % cols.length === 1 && i === n - 1) g.fillStyle = cols[(i + 2) % cols.length]; g.fill();
        g.strokeStyle = U.cssVar('--surface'); g.lineWidth = 4; g.stroke();
        if (it.length) { g.save(); g.rotate(i * seg + seg / 2); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = U.cssVar('--surface');
          const fs = Math.max(18, Math.min(40, 360 / n + 12)); g.font = '600 ' + fs + 'px ' + U.cssVar('--font-sans');
          let t = it[i]; const maxW = R - 90; while (g.measureText(t).width > maxW && t.length > 2) t = t.slice(0, -2) + '…'; g.fillText(t, R - 24, 0); g.restore(); }
      }
      g.restore(); g.beginPath(); g.arc(W / 2, W / 2, R, 0, Math.PI * 2); g.lineWidth = 8; g.strokeStyle = U.cssVar('--ink-strong'); g.stroke();
      U.$(root, '#cnt').textContent = it.length + ' lựa chọn'; ctx.save({ list: ta.value, sound: U.$(root, '#snd').checked });
    }
    function winnerIndex(n) { const seg = Math.PI * 2 / n; const a = ((-rot) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); return Math.floor(a / seg) % n; }
    function spin() {
      const it = items(); if (spinning) return; if (it.length < 2) { ctx.toast('Cần ít nhất 2 lựa chọn'); return; }
      spinning = true; U.$(root, '#resbox').hidden = true;
      const start = rot, total = Math.PI * 2 * (6 + U.rand(4)) + (U.rand(10000) / 10000) * Math.PI * 2, dur = 4200 + U.rand(800), t0 = performance.now();
      let lastIdx = winnerIndex(it.length);
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4); rot = start + total * e; draw();
        const idx = winnerIndex(it.length); if (idx !== lastIdx) { lastIdx = idx; if (U.$(root, '#snd').checked) U.beep(1400, 0.03, 0.06); }
        if (p < 1) raf = requestAnimationFrame(step); else done(it[winnerIndex(it.length)]);
      };
      raf = requestAnimationFrame(step);
    }
    function done(w) {
      spinning = false; lastWin = w; if (U.$(root, '#snd').checked) U.alarm();
      U.$(root, '#out').textContent = w; U.$(root, '#resbox').hidden = false; U.$(root, '#out').classList.add('pop');
      hist.unshift([w, U.time()]); U.$(root, '#hist').innerHTML = historyList(hist);
      if (U.$(root, '#auto').checked) removeWin();
    }
    function removeWin() { if (lastWin == null) return; const it = items(); const i = it.indexOf(lastWin); if (i >= 0) { it.splice(i, 1); ta.value = it.join('\n'); draw(); ctx.toast('Đã loại “' + lastWin + '”'); } lastWin = null; }
    U.$(root, '#go').onclick = spin; U.$(root, '#hub').onclick = spin; U.$(root, '#rmwin').onclick = removeWin;
    U.$(root, '#cpwin').onclick = () => ctx.copy(U.$(root, '#out').textContent);
    ta.addEventListener('input', draw); U.$(root, '#snd').addEventListener('change', draw);
    const addOne = () => { const v = U.$(root, '#add').value.trim(); if (!v) return; ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + v; U.$(root, '#add').value = ''; draw(); };
    U.$(root, '#addb').onclick = addOne; U.$(root, '#add').addEventListener('keydown', e => { if (e.key === 'Enter') addOne(); });
    U.$(root, '#shuf').onclick = () => { ta.value = U.shuffle(items()).join('\n'); draw(); };
    U.$(root, '#imp').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { ta.value = t.split(/\r?\n|,|;/).map(x => x.trim()).filter(Boolean).join('\n'); draw(); ctx.toast('Đã nhập ' + items().length + ' lựa chọn'); }); });
    U.$(root, '#exp').onclick = () => ctx.download('vong-quay.txt', items().join('\n'));
    U.$(root, '#clr').onclick = () => { hist.length = 0; U.$(root, '#hist').innerHTML = historyList(hist); };
    U.$(root, '#hist').innerHTML = historyList(hist);
    const mo = new MutationObserver(() => draw()); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    ctx.onCleanup(() => { cancelAnimationFrame(raf); mo.disconnect(); });
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(draw); draw();
  } });

/* ---------- wheel/draw lots ---------- */
D({ slug: 'boc-tham', name: 'Bốc thăm online', cat: 'wheel', icon: '🎟️', isNew: true, desc: 'Bốc thăm ngẫu nhiên: lật từng lá thăm hoặc bốc theo số thứ tự', pop: 76,
  kw: 'boc tham online rut tham lucky draw chia bang boc tham chia cap thi dau quay so', h1: 'Bốc thăm online', aliases: ['boc-tham-online'],
  related: ['vong-quay-may-man', 'quay-random', 'chia-doi', 'random-so'],
  render(root, ctx) {
    let mode = 'list';
    root.innerHTML = U.tabs('mode', [['list', 'Bốc từ danh sách'], ['num', 'Bốc số thứ tự']], mode) + '<div id="cfg"></div>' +
      '<div class="btn-row"><button class="btn btn-primary" type="button" id="mk">Tạo lá thăm</button><button class="btn" type="button" id="all">Lật tất cả</button><button class="btn btn-ghost" type="button" id="cp">Sao chép kết quả</button></div>' +
      '<p class="hint">Bấm vào từng lá thăm để mở. Thứ tự lá thăm đã được xáo ngẫu nhiên.</p><div class="lots" id="lots"></div>';
    const cfg = () => { U.$(root, '#cfg').innerHTML = mode === 'list' ? '<div class="field"><label class="label" for="items">Nội dung các lá thăm (mỗi dòng một lá)</label><textarea class="textarea" id="items" rows="6">Bảng A\nBảng A\nBảng B\nBảng B\nBảng C\nBảng C\nBảng D\nBảng D</textarea></div>'
      : '<div class="form-grid">' + U.num('n', 'Số lá thăm', { value: '12', mode: 'numeric' }) + '</div>'; };
    let opened = [];
    const make = () => {
      const items = mode === 'list' ? U.lines(U.$(root, '#items').value) : Array.from({ length: Math.max(1, Math.min(200, Math.round(U.val(root, 'n')) || 12)) }, (_, i) => String(i + 1));
      if (!items.length) { ctx.toast('Chưa có lá thăm'); return; }
      const sh = U.shuffle(items); opened = [];
      U.$(root, '#lots').innerHTML = sh.map((v, i) => '<button class="lot" type="button" data-v="' + esc(v) + '" aria-label="Lá thăm ' + (i + 1) + '">#' + (i + 1) + '</button>').join('');
    };
    U.$(root, '#lots').addEventListener('click', e => { const b = e.target.closest('.lot'); if (!b || b.classList.contains('open')) return; b.classList.add('open'); b.textContent = b.dataset.v; opened.push(b.getAttribute('aria-label') + ': ' + b.dataset.v); U.beep(660, 0.05, 0.05); });
    U.$(root, '#all').onclick = () => U.$$(root, '.lot:not(.open)').forEach(b => b.click());
    U.$(root, '#mk').onclick = make; U.$(root, '#cp').onclick = () => opened.length ? ctx.copy(opened.join('\n')) : ctx.toast('Chưa mở lá thăm nào');
    U.bindTabs(root, 'mode', v => { mode = v; cfg(); make(); }); cfg(); make();
  } });

/* ---------- team/split ---------- */
D({ slug: 'chia-doi', name: 'Chia đội ngẫu nhiên', cat: 'team', icon: '👥', desc: 'Chia danh sách người thành các đội hoặc nhóm đều nhau, ngẫu nhiên', pop: 83,
  kw: 'random team chia doi random generator chia doi chia nhom ngau nhien team chia to chia cap group generator', h1: 'Chia đội ngẫu nhiên online', aliases: ['chia-doi-tu-dong', 'chia-nhom-tu-dong', 'chia-cap-ngau-nhien'],
  related: ['quay-random', 'vong-quay-may-man', 'boc-tham', 'random-ten'],
  render(root, ctx) {
    const st = ctx.state({ list: SAMPLE + '\nTrương Mỹ Linh\nCao Gia Bảo\nLâm Khánh Vy\nĐoàn Nhật Minh' }); let by = 'teams', last = [];
    root.innerHTML = '<div class="split"><div class="field"><label class="label" for="list">Danh sách người (mỗi dòng một người)</label><textarea class="textarea" id="list" rows="9"></textarea><span class="hint" id="cnt"></span></div>' +
      '<div class="stack">' + U.tabs('by', [['teams', 'Theo số đội'], ['size', 'Theo số người/đội']], by) + U.num('n', 'Số đội', { value: '3', mode: 'numeric' }) +
      '<button class="btn btn-primary btn-lg btn-block" type="button" id="go">CHIA ĐỘI</button><div class="btn-row"><button class="btn" type="button" id="again">Random lại</button><button class="btn" type="button" id="cp">Sao chép kết quả</button></div></div></div><div class="team-grid" id="out"></div>';
    const ta = U.$(root, '#list'); ta.value = st.list;
    const cnt = () => { U.$(root, '#cnt').textContent = U.lines(ta.value).length + ' người'; ctx.save({ list: ta.value }); }; ta.addEventListener('input', cnt); cnt();
    const go = () => {
      const p = U.shuffle(U.lines(ta.value)), n = Math.max(1, Math.round(U.val(root, 'n')) || 1); if (p.length < 2) { ctx.toast('Cần ít nhất 2 người'); return; }
      const k = by === 'teams' ? Math.min(n, p.length) : Math.max(1, Math.ceil(p.length / n));
      last = Array.from({ length: k }, () => []); p.forEach((x, i) => last[i % k].push(x));
      U.$(root, '#out').innerHTML = last.map((t, i) => '<div class="team"><h4><span>Đội ' + (i + 1) + '</span><span class="badge">' + t.length + ' người</span></h4><ul>' + t.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>').join('');
    };
    U.bindTabs(root, 'by', v => { by = v; root.querySelector('label[for="n"]').textContent = v === 'teams' ? 'Số đội' : 'Số người mỗi đội'; });
    U.$(root, '#go').onclick = go; U.$(root, '#again').onclick = go;
    U.$(root, '#cp').onclick = () => last.length ? ctx.copy(last.map((t, i) => 'Đội ' + (i + 1) + ':\n' + t.map(x => '- ' + x).join('\n')).join('\n\n')) : ctx.toast('Chưa chia đội');
    go();
  } });

/* ---------- random/coin ---------- */
D({ slug: 'tung-dong-xu', name: 'Tung đồng xu', cat: 'random', icon: '🪙', desc: 'Tung đồng xu sấp ngửa online có hiệu ứng và thống kê', pop: 79,
  kw: 'random coin flip tung dong xu sap ngua head tail quyet dinh ngau nhien', h1: 'Tung đồng xu online', aliases: ['tung-nhieu-dong-xu', 'random-yes-no', 'random-a-b'],
  related: ['tung-xuc-xac', 'quay-random', 'random-so', 'vong-quay-may-man'],
  render(root, ctx) {
    const s = ctx.state({ h: 0, t: 0 }); let deg = 0, busy = false;
    root.innerHTML = '<div class="coin-stage"><div class="coin" id="coin"><div class="coin-face">NGỬA</div><div class="coin-face back">SẤP</div></div></div>' +
      '<div class="big-result" style="min-height:80px"><div class="v" id="out">Sẵn sàng</div></div><button class="btn btn-primary btn-lg btn-block" type="button" id="go">🪙 TUNG ĐỒNG XU</button>' +
      '<div class="stat-grid"><div class="stat"><div class="stat-label">Ngửa</div><div class="stat-value" id="sh">0</div></div><div class="stat"><div class="stat-label">Sấp</div><div class="stat-value" id="stt">0</div></div><div class="stat"><div class="stat-label">Tổng số lần</div><div class="stat-value" id="sn">0</div></div></div>' +
      '<div class="progress"><span id="bar" style="width:50%"></span></div><div class="row"><button class="btn btn-sm btn-ghost" type="button" id="rs">Đặt lại thống kê</button></div>';
    const paint = () => { U.$(root, '#sh').textContent = s.h; U.$(root, '#stt').textContent = s.t; U.$(root, '#sn').textContent = s.h + s.t; U.$(root, '#bar').style.width = (s.h + s.t ? s.h / (s.h + s.t) * 100 : 50) + '%'; ctx.save(s); };
    U.$(root, '#go').onclick = () => { if (busy) return; busy = true; const head = U.rand(2) === 0; deg += 1800 + (head ? (deg % 360 === 0 ? 0 : 180) : (deg % 360 === 0 ? 180 : 0));
      U.$(root, '#coin').style.transform = 'rotateY(' + deg + 'deg)'; U.$(root, '#out').textContent = '…';
      setTimeout(() => { const r = (deg % 360) === 0 ? 'NGỬA' : 'SẤP'; r === 'NGỬA' ? s.h++ : s.t++; U.$(root, '#out').textContent = r; U.$(root, '#out').classList.remove('pop'); void U.$(root, '#out').offsetWidth; U.$(root, '#out').classList.add('pop'); paint(); busy = false; }, 1150); };
    U.$(root, '#rs').onclick = () => { s.h = 0; s.t = 0; paint(); }; paint();
  } });

/* ---------- random/dice ---------- */
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function dieHtml(v, sides) { if (sides === 6) return '<div class="die"><div class="die-face">' + Array.from({ length: 9 }, (_, i) => '<i style="visibility:' + (PIPS[v].includes(i) ? 'visible' : 'hidden') + '"></i>').join('') + '</div></div>'; return '<div class="die">' + v + '</div>'; }
function dice(defSides, lockSides) {
  return (root, ctx) => {
    let sides = defSides; const hist = [];
    root.innerHTML = (lockSides ? '' : '<div class="field"><span class="label">Loại xúc xắc</span>' + U.chips('sides', [4, 6, 8, 10, 12, 20].map(n => [n, 'D' + n]), sides) + '</div>') +
      '<div class="form-grid">' + U.num('n', 'Số lượng xúc xắc', { value: lockSides ? '1' : '2', mode: 'numeric' }) + '</div>' +
      '<div class="dice-row" id="row"></div><div class="big-result" style="min-height:80px"><div class="v" id="sum">—</div></div>' +
      '<button class="btn btn-primary btn-lg btn-block" type="button" id="go">🎲 TUNG XÚC XẮC</button>' +
      '<div class="spread"><span class="t-caption">Lịch sử các lần tung</span><button class="btn btn-sm btn-ghost" type="button" id="clr">Xóa lịch sử</button></div><ul class="history" id="hist"></ul>';
    const n = () => Math.max(1, Math.min(12, Math.round(U.val(root, 'n')) || 1));
    const show = vals => { U.$(root, '#row').innerHTML = vals.map(v => dieHtml(v, sides)).join(''); };
    show(Array.from({ length: n() }, () => sides === 6 ? 6 : sides));
    if (!lockSides) U.bindChips(root, 'sides', v => { sides = +v; show(Array.from({ length: n() }, () => sides)); });
    U.$(root, '#hist').innerHTML = historyList(hist);
    U.$(root, '#go').onclick = () => {
      const vals = Array.from({ length: n() }, () => 1 + U.rand(sides)); show(vals); U.$$(root, '.die').forEach(d => d.classList.add('roll')); U.beep(300, 0.06, 0.05);
      const total = vals.reduce((a, b) => a + b, 0); const txt = vals.length > 1 ? vals.join(' + ') + ' = ' + total : String(total);
      U.$(root, '#sum').textContent = txt; U.$(root, '#sum').classList.remove('pop'); void U.$(root, '#sum').offsetWidth; U.$(root, '#sum').classList.add('pop');
      hist.unshift(['D' + sides + ' × ' + vals.length + ': ' + txt, U.time()]); U.$(root, '#hist').innerHTML = historyList(hist);
    };
    U.$(root, '#clr').onclick = () => { hist.length = 0; U.$(root, '#hist').innerHTML = historyList(hist); };
  };
}
D({ slug: 'tung-xuc-xac', name: 'Tung xúc xắc', cat: 'random', icon: '🎲', desc: 'Xúc xắc D4, D6, D8, D10, D12, D20, tung nhiều viên cùng lúc', pop: 91,
  kw: 'random dice roller tung xuc xac do xi ngau d4 d6 d8 d10 d12 d20 rpg board game', h1: 'Tung xúc xắc online', seoTitle: 'Tung Xúc Xắc Online – Xúc Xắc D6, D20 Miễn Phí',
  aliases: ['tung-xuc-xac-d4', 'tung-xuc-xac-d8', 'tung-xuc-xac-d10', 'tung-xuc-xac-d12', 'tung-nhieu-xuc-xac', 'xuc-xac-rpg'], related: ['xuc-xac-d6', 'xuc-xac-d20', 'tung-dong-xu', 'random-so'],
  render: dice(6, false) });
D({ slug: 'xuc-xac-d6', name: 'Xúc xắc D6', cat: 'random', icon: '⚀', desc: 'Xúc xắc 6 mặt truyền thống cho cờ cá ngựa, board game', pop: 66,
  kw: 'xuc xac 6 mat d6 dice co ca ngua xi ngau', h1: 'Tung xúc xắc 6 mặt (D6)', aliases: ['tung-xuc-xac-d6'], related: ['tung-xuc-xac', 'xuc-xac-d20', 'tung-dong-xu'], render: dice(6, true) });
D({ slug: 'xuc-xac-d20', name: 'Xúc xắc D20', cat: 'random', icon: '🔷', desc: 'Xúc xắc 20 mặt cho game nhập vai D&D, RPG', pop: 55,
  kw: 'xuc xac 20 mat d20 dnd dungeons dragons rpg', h1: 'Tung xúc xắc 20 mặt (D20)', aliases: ['tung-xuc-xac-d20'], related: ['tung-xuc-xac', 'xuc-xac-d6', 'random-so'], render: dice(20, true) });
})();
