# stls — Render video Sự Thật Lịch Sử (bản cho khách)

Công cụ tạo video tự động. Cần **key còn hạn** do nhà cung cấp cấp.

## Cài một lần

1. Cài [Node.js 20+](https://nodejs.org).
2. Mở Terminal trong thư mục này, chạy:
   ```
   npm install
   ```
3. Kích hoạt key (gắn với máy này):
   ```
   node stls.mjs activate STLS-XXXX-XXXX-XXXX-XXXX
   ```

## Tạo video

Chuẩn bị tư liệu và viết `tap.json` theo `AGENTS.md`, rồi:

```
node stls.mjs render du_an/tap01/tap.json out/tap01.mp4
```

Xem tình trạng key: `node stls.mjs status`.

## Lưu ý

- Key gắn với **một máy** và có **thời hạn**. Hết hạn → không render được;
  liên hệ nhà cung cấp để gia hạn.
- Máy phải **có mạng** khi render (để xác thực giấy phép).
- Ảnh/âm thanh đặt trong `public/` theo `AGENTS.md`.
