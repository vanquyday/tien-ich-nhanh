// Build Tiện Ích Nhanh thành website tĩnh trong thư mục dist/.
// Chạy:  node build.mjs      (không cần cài thêm thư viện nào, chỉ cần Node.js 18+)
//
// Kết quả:
//   dist/index.html, dist/tools/<slug>/index.html, dist/danh-muc/<cat>/index.html, ...
//   dist/assets/app.<hash>.js + app.<hash>.css  (dùng chung cho mọi trang, cache lâu dài)
//   dist/sitemap.xml, dist/robots.txt, dist/404.html
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const r = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const cfg = JSON.parse(r('site.config.json'));
// Biến môi trường (dùng khi build trên GitHub Actions) được ưu tiên hơn site.config.json
const SITE = (process.env.SITE_URL || cfg.siteUrl).replace(/\/$/, '');
const BASE = (process.env.BASE_PATH ?? cfg.basePath ?? '').replace(/\/$/, '');   // '' = chạy ở gốc tên miền
const NOINDEX = process.env.NOINDEX === '1' || cfg.noindex === true;            // true = chặn Google (bản thử nghiệm)
// 'full' = mỗi công cụ một file HTML (tốt cho SEO, ~800 file) · 'spa' = chỉ vài file, trang con do 404.html + JS hiển thị (để thử nghiệm)
const MODE = process.env.BUILD_MODE || cfg.buildMode || 'full';
const OUT = path.join(ROOT, 'dist');

// ---------- 1. Gom mã nguồn ----------
const list = dir => fs.readdirSync(path.join(ROOT, dir)).filter(f => /\.(js|css)$/.test(f)).sort().map(f => dir + '/' + f);
const css = ['src/styles/tokens.css', 'src/styles/components.css', 'src/styles/app.css'].map(r).join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
const catalog = r('src/data/catalog.json');
const toolFiles = list('src/tools');                         // mọi file trong src/tools/ được nạp tự động
const body = [...list('src/core'), ...toolFiles].map(f => `/* ${f} */\n` + r(f)).join('\n');
const head = `window.TI={CATALOG:${catalog},PATH_MODE:true,SITE_URL:${JSON.stringify(SITE)},BASE_PATH:${JSON.stringify(BASE)}};\n`;
const appJs = head + body + '\nTI.boot();\n';

const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const jsName = `app.${hash(appJs)}.js`, cssName = `app.${hash(css)}.css`;

// ---------- 2. Đọc registry công cụ (chạy mã trong sandbox, không render) ----------
const sandbox = { window: {}, TextEncoder, TextDecoder, Intl, console, setTimeout, clearTimeout, crypto: globalThis.crypto };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext('var window = this.window;' + head + body, sandbox, { filename: 'app.js' });
const TI = sandbox.window.TI;
TI.buildIndex();
const ALL = TI.ALL, LIVE = TI.LIVE, CATS = TI.CATS, CAT = TI.CAT;

// ---------- 3. Khuôn trang ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ld = o => o ? `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>` : '';
const ga = cfg.googleAnalyticsId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(cfg.googleAnalyticsId)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(cfg.googleAnalyticsId)}');</script>` : '';
const ads = cfg.adsenseClientId ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(cfg.adsenseClientId)}" crossorigin="anonymous"></script>` : '';
const staticHeader = `<header class="hdr" id="hdr"><div class="wrap hdr-in"><a class="logo" href="/">${esc(cfg.siteName)}</a><nav class="nav" aria-label="Chính"><a href="/">Trang chủ</a><a href="/tools">Danh mục</a><a href="/pho-bien">Công cụ phổ biến</a><a href="/moi">Công cụ mới</a><a href="/favorites">Yêu thích</a></nav></div></header>`;
const staticFooter = `<footer class="ftr" id="ftr"><div class="wrap"><nav aria-label="Danh mục"><ul style="display:flex;flex-wrap:wrap;gap:8px 16px;list-style:none;padding:0">${CATS.map(c => `<li><a href="/danh-muc/${c.id}">${esc(c.name)}</a></li>`).join('')}</ul></nav><p class="t-small muted">© ${new Date().getFullYear()} ${esc(cfg.siteName)}</p></div></footer>`;

function page({ url, title, desc, main, jsonld, noindex = false }) {
  const canonical = SITE + url;
  return `<!doctype html>
<html lang="${cfg.language || 'vi'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
${noindex || NOINDEX ? '<meta name="robots" content="noindex,follow">' : ''}
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(cfg.siteName)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canonical)}">
<meta name="theme-color" content="#2563EB">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap">
<link rel="stylesheet" href="/assets/${cssName}">
<script>try{var t=localStorage.getItem('ti_theme');if(t&&t!=='null')document.documentElement.setAttribute('data-theme',JSON.parse(t))}catch(e){}</script>
${ld(jsonld)}${ga}${ads}
</head>
<body>
${staticHeader}
<main id="app"><div class="wrap stack">${main}</div></main>
${staticFooter}
<nav class="bnav" id="bnav" aria-label="Điều hướng nhanh"></nav>
<script src="/assets/${jsName}" defer></script>
</body>
</html>
`;
}
const crumbs = items => `<ol class="crumbs">${items.map(([n, u], i) => `<li>${u && i < items.length - 1 ? `<a href="${u}">${esc(n)}</a>` : `<span aria-current="page">${esc(n)}</span>`}</li>`).join('')}</ol>`;
const toolLinks = ts => `<ul class="link-list">${ts.map(t => `<li><a href="/tools/${t.slug}">${esc(t.name)}</a> – ${esc(t.desc)}</li>`).join('')}</ul>`;
const byPop = (a, b) => (b.live - a.live) || (b.pop - a.pop);

// ---------- 4. Ghi file ----------
fs.rmSync(OUT, { recursive: true, force: true });
const withBase = c => BASE ? c.replace(/((?:href|src)="|url=)\/(?!\/)/g, `$1${BASE}/`) : c;
const write = (rel, content) => { if (rel.endsWith('.html')) content = withBase(content); const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };
write('assets/' + jsName, appJs);
write('assets/' + cssName, css);
for (const f of fs.readdirSync(path.join(ROOT, 'public'))) fs.copyFileSync(path.join(ROOT, 'public', f), path.join(OUT, f));

if (MODE === 'spa') {
  const shell = (title, desc) => page({ url: '/', title, desc, noindex: NOINDEX, main: `<h1 class="t-display">Mọi công cụ bạn cần, ngay trên một website.</h1>${toolLinks(LIVE.slice().sort(byPop).slice(0, 24))}` });
  write('index.html', shell(`${cfg.siteName} – Hàng trăm công cụ online miễn phí`, 'Hàng trăm tiện ích miễn phí cho công việc, học tập, kinh doanh và cuộc sống hằng ngày.'));
  write('404.html', shell(cfg.siteName, 'Công cụ online miễn phí'));
  write('robots.txt', NOINDEX ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
  write('.nojekyll', '');
  const n = fs.readdirSync(OUT, { recursive: true }).filter(f => fs.statSync(path.join(OUT, f)).isFile()).length;
  console.log(`✓ Build xong (chế độ spa, ${n} file${BASE ? ', đường dẫn gốc ' + BASE : ''}): ${LIVE.length} công cụ chạy được`);
  process.exit(0);
}
const sitemap = [];
const add = (url, html, inSitemap = true, prio = '0.6') => { write(url === '/' ? 'index.html' : url.slice(1) + '/index.html', html); if (inSitemap) sitemap.push([url, prio]); };

// Trang chủ
add('/', page({ url: '/', title: `${cfg.siteName} – Hàng trăm công cụ online miễn phí`, desc: 'Hàng trăm tiện ích miễn phí cho công việc, học tập, kinh doanh và cuộc sống: đếm ký tự, tính phần trăm, quay random, tạo QR, nén ảnh…',
  jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.siteName, url: SITE + '/' },
  main: `<h1 class="t-display">Mọi công cụ bạn cần, ngay trên một website.</h1><p>Hàng trăm tiện ích miễn phí cho công việc, học tập, kinh doanh và cuộc sống hàng ngày.</p><h2>Công cụ phổ biến</h2>${toolLinks(LIVE.slice().sort(byPop).slice(0, 24))}` }), true, '1.0');

// Danh sách & danh mục
const dirMain = (title, ts) => `${crumbs([['Trang chủ', '/'], [title]])}<h1 class="t-h1">${esc(title)}</h1>${toolLinks(ts)}`;
add('/tools', page({ url: '/tools', title: `Tất cả công cụ – ${cfg.siteName}`, desc: `Danh sách ${ALL.length} công cụ online miễn phí theo ${CATS.length} danh mục.`, main: dirMain('Tất cả công cụ', LIVE.slice().sort(byPop)) }), true, '0.9');
add('/pho-bien', page({ url: '/pho-bien', title: `Công cụ phổ biến – ${cfg.siteName}`, desc: 'Những công cụ được dùng nhiều nhất.', main: dirMain('Công cụ phổ biến', LIVE.slice().sort(byPop).slice(0, 40)) }), true, '0.7');
add('/moi', page({ url: '/moi', title: `Công cụ mới – ${cfg.siteName}`, desc: 'Các công cụ vừa ra mắt.', main: dirMain('Công cụ mới', LIVE.filter(t => t.isNew).reverse()) }), true, '0.7');
for (const c of CATS) {
  const ts = ALL.filter(t => t.cat === c.id).sort(byPop);
  add('/danh-muc/' + c.id, page({ url: '/danh-muc/' + c.id, title: `Công cụ ${c.name} online miễn phí – ${cfg.siteName}`, desc: c.desc + '. Miễn phí, không cần cài đặt.',
    jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.name, url: SITE + '/danh-muc/' + c.id },
    main: `${crumbs([['Trang chủ', '/'], ['Công cụ', '/tools'], [c.name]])}<h1 class="t-h1">${esc(c.name)}</h1><p>${esc(c.desc)}</p>${toolLinks(ts.filter(t => t.live))}` }), ts.some(t => t.live), '0.8');
}
// Trang công cụ (công cụ "sắp ra mắt" để noindex, không đưa vào sitemap)
for (const t of ALL) {
  const S = TI.seoFor(t), rel = TI.relatedOf(t);
  add('/tools/' + t.slug, page({ url: '/tools/' + t.slug, title: S.title, desc: S.desc, jsonld: S.ld, noindex: !t.live,
    main: `${crumbs([['Trang chủ', '/'], [S.cat.name, '/danh-muc/' + S.cat.id], [t.name]])}<h1 class="t-h1">${esc(S.h1)}</h1><p>${esc(t.desc)}</p>` +
      `<noscript><p class="notice">Hãy bật JavaScript để dùng công cụ này.</p></noscript>` +
      (t.live ? `<section><h2 class="t-h3">Câu hỏi thường gặp</h2>${S.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}</section>` : '<p>Công cụ đang được phát triển.</p>') +
      `<section><h2 class="t-h3">Có thể bạn cũng cần</h2>${toolLinks(rel)}</section>` }), t.live, t.pop >= 85 ? '0.9' : '0.8');
  for (const a of t.aliases || []) write('tools/' + a + '/index.html', `<!doctype html><meta charset="utf-8"><title>${esc(t.name)}</title><link rel="canonical" href="${SITE}/tools/${t.slug}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/tools/${t.slug}"><a href="/tools/${t.slug}">${esc(t.name)}</a>`);
}
// Trang phụ
for (const [u, title, noindex] of [['/favorites', 'Công cụ yêu thích', true], ['/admin', 'Quản trị', true], ['/gioi-thieu', 'Giới thiệu'], ['/lien-he', 'Liên hệ'], ['/bao-mat', 'Chính sách bảo mật'], ['/dieu-khoan', 'Điều khoản sử dụng'], ['/cookie', 'Chính sách cookie']])
  add(u, page({ url: u, title: `${title} – ${cfg.siteName}`, desc: title, noindex, main: `<h1 class="t-h1">${esc(title)}</h1>` }), !noindex, '0.3');
write('404.html', page({ url: '/404', title: `Không tìm thấy trang – ${cfg.siteName}`, desc: 'Trang không tồn tại.', noindex: true, main: '<h1 class="t-h1">Có vẻ công cụ này chưa được phát minh 😅</h1><p><a href="/tools">Xem tất cả công cụ</a></p>' }));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(([u, p]) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', NOINDEX ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`✓ Build xong${BASE ? ' (đường dẫn gốc ' + BASE + ')' : ''}${NOINDEX ? ' · chế độ thử nghiệm, chặn Google' : ''}: ${LIVE.length} công cụ chạy được, ${ALL.length} trang công cụ, ${sitemap.length} URL trong sitemap`);
console.log(`  JS ${(appJs.length / 1024).toFixed(0)} KB · CSS ${(css.length / 1024).toFixed(0)} KB · thư mục: dist/`);
