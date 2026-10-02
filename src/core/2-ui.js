/* Shared building blocks used by every tool module (the design system in code). */
(function () {
const TI = window.TI, esc = TI.esc;
const U = TI.ui = {};
U.$ = (r, s) => r.querySelector(s);
U.$$ = (r, s) => Array.from(r.querySelectorAll(s));
let uid = 0; U.id = p => (p || 'f') + (++uid);

/* Number field with unit: Label / Input / Unit */
U.num = (id, label, { unit, value = '', hint, ph = '0', mode = 'decimal' } = {}) =>
  '<div class="field"><label class="label" for="' + id + '">' + esc(label) + '</label>' +
  (unit ? '<div class="input-group"><input class="input num" id="' + id + '" inputmode="' + mode + '" autocomplete="off" placeholder="' + esc(ph) + '" value="' + esc(value) + '"><span class="unit">' + esc(unit) + '</span></div>'
        : '<input class="input num" id="' + id + '" inputmode="' + mode + '" autocomplete="off" placeholder="' + esc(ph) + '" value="' + esc(value) + '">') +
  (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</div>';
U.select = (id, label, opts, value) => '<div class="field"><label class="label" for="' + id + '">' + esc(label) + '</label><select class="select" id="' + id + '">' +
  opts.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>';
U.tabs = (id, items, cur) => '<div class="tabs" role="tablist" id="' + id + '">' + items.map(([v, t]) => '<button class="tab" type="button" role="tab" data-v="' + v + '" aria-selected="' + (v === cur) + '">' + esc(t) + '</button>').join('') + '</div>';
U.bindTabs = (root, id, fn) => {
  const el = root.querySelector('#' + id);
  el.addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; el.querySelectorAll('.tab').forEach(x => x.setAttribute('aria-selected', x === b)); fn(b.dataset.v); });
};
U.chips = (id, items, cur) => '<div class="chips" id="' + id + '">' + items.map(([v, t]) => '<button class="chip" type="button" data-v="' + v + '" aria-pressed="' + (String(v) === String(cur)) + '">' + esc(t) + '</button>').join('') + '</div>';
U.bindChips = (root, id, fn) => {
  const el = root.querySelector('#' + id);
  el.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; el.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b)); fn(b.dataset.v); });
};
U.val = (root, id) => TI.parseNum(root.querySelector('#' + id).value);

/* Result card: number big, formula, explanation, copy */
U.result = (id, label) => '<div class="result" id="' + id + '" aria-live="polite"><div class="result-head"><span class="result-label">' + esc(label || 'Kết quả') + '</span>' +
  '<button class="btn btn-sm btn-soft" type="button" data-copy="' + id + '">Sao chép</button></div><div class="result-value" data-r="v">—</div><div class="result-formula" data-r="f"></div><div class="result-note" data-r="n"></div></div>';
U.setResult = (root, id, { value, formula = '', note = '', copy }) => {
  const r = root.querySelector('#' + id);
  r.querySelector('[data-r="v"]').textContent = value == null ? '—' : value;
  r.querySelector('[data-r="f"]').textContent = formula; r.querySelector('[data-r="n"]').innerHTML = note;
  r.dataset.copyText = copy != null ? copy : (value == null ? '' : value);
};
U.bindCopy = (root, ctx) => root.addEventListener('click', e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  const r = root.querySelector('#' + b.dataset.copy); const t = r.dataset.copyText != null ? r.dataset.copyText : (r.value != null ? r.value : r.textContent);
  if (t && t !== '—') ctx.copy(t); else ctx.toast('Chưa có kết quả để sao chép');
});

/* Generic calculator: fields + compute(values) -> result */
U.calc = (root, ctx, { fields, compute, top = '', bottom = '', label = 'Kết quả', button = 'Tính toán' }) => {
  root.innerHTML = top + '<div class="form-grid">' + fields.map(f => U.num(f.id, f.label, f)).join('') + '</div>' +
    '<button class="btn btn-primary btn-lg btn-block" type="button" data-calc>' + esc(button) + '</button>' + U.result('res', label) + bottom;
  const run = () => {
    const v = {}; fields.forEach(f => v[f.id] = U.val(root, f.id));
    let r; try { r = compute(v, root); } catch (e) { r = null; }
    if (!r) { U.setResult(root, 'res', { value: '—', formula: 'Nhập đủ các giá trị để xem kết quả', note: '' }); return; }
    U.setResult(root, 'res', r);
  };
  root.addEventListener('input', e => { if (e.target.matches('input,select')) run(); });
  root.addEventListener('change', e => { if (e.target.matches('select')) run(); });
  root.querySelector('[data-calc]').addEventListener('click', () => { run(); root.querySelector('#res').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
  U.bindCopy(root, ctx); run();
  return run;
};

/* Text area tool shell: input, action buttons, optional output */
U.textArea = (id, ph, rows) => '<label class="sr-only" for="' + id + '">Văn bản</label><textarea class="textarea" id="' + id + '" placeholder="' + esc(ph) + '"' + (rows ? ' rows="' + rows + '"' : '') + ' spellcheck="false"></textarea>';
U.lines = s => s.split(/\r?\n/).map(x => x.trim()).filter(Boolean);

/* Secure random int in [0, n) */
U.rand = n => { if (n <= 1) return 0; const max = Math.floor(0x100000000 / n) * n; const a = new Uint32Array(1); let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= max); return x % n; };
U.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = U.rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
U.time = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/* Beep (WebAudio, chỉ phát sau thao tác người dùng) */
let actx;
U.beep = (freq = 880, dur = 0.12, vol = 0.15) => {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = freq; o.type = 'sine'; g.gain.value = vol; o.connect(g); g.connect(actx.destination); const t = actx.currentTime;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02); } catch (e) {}
};
U.alarm = () => { [0, 250, 500].forEach(d => setTimeout(() => U.beep(988, 0.18, 0.2), d)); };

/* File drop zone */
U.drop = (id, title, accept) => '<label class="drop" id="' + id + '"><span style="font-size:32px" aria-hidden="true">🖼️</span><span class="drop-title">' + esc(title) + '</span><span>hoặc</span><span class="btn btn-primary">Chọn ' + (accept && accept.includes('image') ? 'ảnh' : 'file') + '</span><span class="hint">Ảnh được xử lý ngay trên máy bạn, không tải lên máy chủ</span><input type="file" accept="' + esc(accept || '*') + '"></label>';
U.bindDrop = (root, id, onFile) => {
  const z = root.querySelector('#' + id), inp = z.querySelector('input');
  inp.addEventListener('change', () => inp.files[0] && onFile(inp.files[0]));
  ['dragenter', 'dragover'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.remove('is-over'); }));
  z.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) onFile(f); });
};
U.bytes = n => n < 1024 ? n + ' B' : n < 1048576 ? TI.fmt(n / 1024, 1) + ' KB' : TI.fmt(n / 1048576, 2) + ' MB';
U.cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* Vietnamese helpers */
U.noAccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
U.dateInput = d => { const z = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
U.parseDate = s => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); if (!y) return null; return new Date(y, m - 1, d); };
U.WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
U.vnDate = d => U.WD[d.getDay()] + ', ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
})();
