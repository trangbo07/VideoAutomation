# Server cấp phép — Sự Thật Lịch Sử

Quản lý key cho công cụ render `stls`. Deploy trên Vercel, lưu key bằng Upstash Redis.

## Endpoint

- `POST /api/activate` `{key, machineId, machineName}` — kích hoạt key lần đầu, gắn máy, bắt đầu tính hạn.
- `POST /api/verify` `{key, machineId}` — cấp "vé" render có chữ ký, sống 15 phút.
- `GET/POST /api/admin` — quản trị (cần header `x-admin-token`).
- `/admin.html` — trang quản trị (tạo/khóa/gia hạn key).

## Biến môi trường (Vercel → Settings → Environment Variables)

| Tên | Giá trị |
|---|---|
| `LICENSE_PRIVATE_KEY` | khóa bí mật Ed25519 (pkcs8/der base64). Khóa công khai tương ứng đã nhúng trong `client/lib/license.mjs`. |
| `ADMIN_TOKEN` | mật khẩu đăng nhập `/admin.html` (chuỗi dài ngẫu nhiên). |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | tự có khi gắn Upstash (Marketplace). |

Tạo cặp khóa mới nếu cần:
```
node -e "const{generateKeyPairSync}=require('crypto');const{publicKey,privateKey}=generateKeyPairSync('ed25519');console.log('PUBLIC='+publicKey.export({type:'spki',format:'der'}).toString('base64'));console.log('PRIVATE='+privateKey.export({type:'pkcs8',format:'der'}).toString('base64'))"
```
Dán PUBLIC vào `client/lib/license.mjs` (biến `PUBLIC_KEY_B64`), PRIVATE vào `LICENSE_PRIVATE_KEY`.

## Deploy

```
cd license-server
vercel link
vercel env add LICENSE_PRIVATE_KEY
vercel env add ADMIN_TOKEN
# gắn Upstash: Vercel Dashboard → Storage → Upstash (hoặc: vercel integration add upstash)
vercel --prod
```

Sau khi có URL (vd. `https://...vercel.app`), cập nhật `DEFAULT_SERVER` trong
`client/lib/license.mjs` rồi đóng gói lại bản khách bằng `npm run dong-goi`.
