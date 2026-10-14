# stls — Render video Sự Thật Lịch Sử (bản cho khách)

Công cụ tạo video tự động. Cần **key còn hạn** do nhà cung cấp cấp.

## Bạn cần chuẩn bị cho mỗi tập

Đặt vào thư mục `public\<tên tập>\` (ví dụ `public\tap01\`):
- **`giong.mp3`** — file giọng đọc của bạn (bắt buộc; video dài đúng bằng file này).
- **`sub.srt`** — file phụ đề (nên có; thiếu thì video không có phụ đề).

Phần **ảnh** và file `tap.json` để **Antigravity tự lo** (tìm ảnh trên mạng và dựng cảnh).

## Cách nhanh (chỉ cần bấm đúp — khuyên dùng)

1. Cài **Node.js** một lần: tải ở https://nodejs.org rồi cài (Next → Next → Finish).
2. Bấm đúp **`1-CaiDat.bat`** → chờ cài xong.
3. Bấm đúp **`2-KichHoat.bat`** → dán KEY nhà cung cấp gửi → Enter.
4. Chuẩn bị `giong.mp3` + `sub.srt` như trên, để Antigravity dựng `tap.json`.
5. Bấm đúp **`3-TaoVideo.bat`** → kéo thả file `tap.json` vào → Enter. Video nằm trong thư mục `out`.

Phần dưới là cách dùng bằng dòng lệnh (cho ai quen Terminal).

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
