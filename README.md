# Tiện Ích Nhanh

Bộ công cụ online cho người Việt: 62 công cụ chạy ngay trên trình duyệt (đếm ký tự, tính phần trăm, quay random, tạo QR, nén ảnh…) và kho 450 công cụ trong lộ trình.

Website tĩnh (HTML + CSS + JS): không cần máy chủ, không cần cơ sở dữ liệu, không cần cài thư viện.

> **Trạng thái: bản thử nghiệm.** Khi chạy trên GitHub Pages, website tự chặn Google (noindex) để không bị lập chỉ mục trước khi ra mắt chính thức.

## Thử trên GitHub Pages

**Cách nhanh (upload trên trình duyệt):** thư mục `docs/` đã build sẵn cho `vanquyday.github.io/tien-ich-nhanh`, chỉ 9 file. Upload repo lên GitHub, rồi vào **Settings → Pages → Deploy from a branch → main / docs → Save**.

Build lại `docs/` (sau khi sửa code):

```
BUILD_MODE=spa BASE_PATH=/tien-ich-nhanh SITE_URL=https://vanquyday.github.io/tien-ich-nhanh NOINDEX=1 node build.mjs
```

rồi thay thư mục `docs/` bằng thư mục `dist/` vừa tạo. (Windows cmd: đặt từng biến bằng `set TEN=gia_tri` trước khi chạy.)

**Cách tự động (GitHub Actions):**

1. Tạo repository mới trên GitHub, ví dụ `tien-ich-nhanh` (Public, hoặc Private nếu tài khoản có GitHub Pro).
2. Đưa thư mục này lên repository bằng một trong hai cách:
   - **GitHub Desktop:** File → Add local repository → chọn thư mục này → Publish repository.
   - **Dòng lệnh:**
     ```
     git remote add origin https://github.com/<tên-bạn>/tien-ich-nhanh.git
     git push -u origin main
     ```
3. Trên GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Vào tab **Actions**, chờ workflow “Deploy GitHub Pages” chạy xong (khoảng 1 phút; nếu nó đã chạy lỗi trước bước 3, bấm **Re-run jobs**).
5. Mở `https://<tên-bạn>.github.io/tien-ich-nhanh/`.

Mỗi lần đẩy code mới lên nhánh `main`, website tự build lại.

> Thư mục `.github` là thư mục ẩn. Nếu upload bằng cách kéo thả trên trình duyệt, nó có thể bị bỏ sót và website sẽ không tự build. Dùng GitHub Desktop hoặc dòng lệnh để chắc chắn.

## Chạy trên máy

Cần Node.js 18 trở lên (https://nodejs.org).

```
node build.mjs        # tạo thư mục dist/
node serve.mjs        # xem tại http://localhost:8080
```

## Khi ra mắt chính thức

1. Sửa `siteUrl` trong `site.config.json` thành tên miền thật.
2. Trong `.github/workflows/deploy.yml`, xóa dòng `NOINDEX: '1'`.
3. Gắn tên miền (Settings → Pages → Custom domain), hoặc chuyển sang Cloudflare Pages: build command `node build.mjs`, output `dist`.

## Cấu hình (`site.config.json`)

| Khóa | Ý nghĩa |
| --- | --- |
| `siteUrl` | Tên miền chính thức, dùng cho canonical và sitemap |
| `siteName` | Tên website |
| `basePath` | Đường dẫn gốc khi website nằm trong thư mục con (GitHub Actions tự điền) |
| `noindex` | `true` = chặn Google |
| `googleAnalyticsId` | Mã GA4 dạng `G-XXXXXXX` |
| `adsenseClientId` | Mã AdSense dạng `ca-pub-XXXXXXXX` |

Biến môi trường `SITE_URL`, `BASE_PATH`, `NOINDEX=1` ghi đè các khóa tương ứng khi build.

## Cấu trúc

```
.github/workflows/    tự build và đưa lên GitHub Pages
site.config.json      cấu hình website
build.mjs             tạo dist/ (mỗi công cụ một trang /tools/<slug>/)
serve.mjs             máy chủ thử trên máy
public/               file copy nguyên vào dist/ (favicon, _headers, .htaccess)
src/styles/           design system: tokens, component, layout
src/core/             khung website: router, tìm kiếm, yêu thích, giao diện chung
src/tools/            các công cụ — mọi file .js ở đây được nạp tự động, theo thứ tự tên file
src/data/catalog.json kho công cụ trong lộ trình (hiện nhãn “Sắp ra mắt”)
```

## Thêm một công cụ

Tạo file mới trong `src/tools/`, ví dụ `05-dot3.js`:

```js
(function () {
const TI = window.TI, U = TI.ui, D = TI.define;
D({
  slug: 'tinh-bmi', name: 'Tính BMI', cat: 'fitness', icon: '⚖️',
  desc: 'Tính chỉ số khối cơ thể BMI từ chiều cao và cân nặng',
  kw: 'bmi chi so khoi co the can nang chieu cao',
  aliases: ['bmi-calculator'],            // slug cũ trong catalog → tự chuyển hướng
  related: ['tinh-tuoi', 'chuyen-doi-don-vi'],
  faq: [['BMI bao nhiêu là bình thường?', 'Từ 18,5 đến dưới 23 theo ngưỡng cho người châu Á.']],
  render(root, ctx) {
    U.calc(root, ctx, {
      fields: [{ id: 'h', label: 'Chiều cao', unit: 'cm', value: '165' }, { id: 'w', label: 'Cân nặng', unit: 'kg', value: '60' }],
      compute: v => v.h > 0 && v.w > 0 ? { value: TI.fmt(v.w / (v.h / 100) ** 2, 1), formula: v.w + ' / (' + v.h / 100 + ')² ' } : null
    });
  }
});
})();
```

Chạy `node build.mjs`. Công cụ tự có trang riêng, nằm trong tìm kiếm, danh mục và sitemap.

## Việc còn lại trước khi public

- Viết chi tiết từng phần, thêm hình minh họa cho trang công cụ và tài liệu hướng dẫn
- Chọn tên thương hiệu, logo, tên miền chính thức
- Thay email liên hệ trong `src/core/1-core.js` (mục `INFO`)
- Kiểm tra tham số lương 2026 và tỷ giá mặc định
