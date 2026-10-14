# Sự Thật Lịch Sử: video lịch sử

Dự án Remotion cho kênh **Sự Thật Lịch Sử**, tách ra từ X Book. Mỗi tập là một video 16:9 gồm giọng đọc, phụ đề, nhạc nền, ảnh tư liệu và các cảnh đồ hoạ: mốc năm, bản đồ, dòng thời gian và thẻ nhân vật.

Lớp “phim cũ” phủ toàn video gồm tông giấy cũ, viền tối, hạt phim, vết xước dọc và nhấp nháy nhẹ. Độ đậm chỉnh bằng `phimCu` (0 = tắt). Góc trái trên có logo kênh, đáy màn hình có thanh tiến trình.

## Mỗi tập cần

Đặt các file vào `public/<tên tập>/`, ví dụ `public/tap01/`:

| File | Bắt buộc | Ghi chú |
|---|---|---|
| `giong.mp3` (hoặc `.wav`, `.mp4`) | có | giọng đọc; độ dài video tự lấy theo file này (`thoiLuong: 0`) |
| `sub.srt` | nên có | phụ đề. Không có thì chạy `python tools/tao_srt.py public/tap01/giong.mp3` (chậm) |
| `nhac.mp3` | không | nhạc nền, tự lặp |

Sau đó sao chép `src/tap/mau.ts` thành `src/tap/tap01.ts`, sửa nội dung, rồi thêm một dòng vào mảng `TAP` trong `src/Root.tsx`.

## Các loại cảnh (`canh.ds`)

Mỗi cảnh kéo dài tới cảnh kế tiếp. Cảnh cuối kéo tới `canh.ketThuc`; sau mốc đó video chuyển sang ảnh lặp (`anhLap`). Muốn dựng cảnh cho cả video thì đặt `ketThuc` bằng độ dài giọng đọc.

| loai | Dùng cho | Trường chính |
|---|---|---|
| `mo` | màn mở đầu, khung viền vàng vẽ dần | `nhan`, `tieuDe[]`, `phu` |
| `anh` | ảnh tràn khung, có thể kèm câu chữ lớn | `anh`, `chu`, `loc`: `goc` / `cu` / `denTrang` |
| `tuLieu` | ảnh tư liệu dạng bản in cũ, dấu năm đỏ, chú thích và nguồn | `chuThich`, `nguon`, `nam`, `hienMau` (đen trắng → màu) |
| `trich` | lời người xưa, trích sử liệu | `loi`, `tacGia` |
| `chuong` | tiêu đề phần | `so`, `tieuDe`, `thoiKy` |
| `moc` | số năm lớn đếm chạy tới mốc | `demTu`, `nam` (năm âm = TCN), `tieuDe`, `diaDiem` |
| `soLieu` | con số lớn đếm chạy (quân số, số năm...) | `so`, `truocSo`, `donVi`, `nhan` |
| `dongThoiGian` | các mốc lần lượt hiện, máy quay trượt theo | `suKien[]`: `nam`, `ten`, `noiBat`, `luc` |
| `banDo` | zoom vào vùng, điểm nhấp nháy, mũi tên hành quân vẽ dần | `zoom`, `diem[]`, `muiTen[]` |
| `nhanVat` | chân dung trong khung + tên, năm sinh–mất, tóm tắt | `ten`, `namSinhMat`, `chucDanh`, `thongTin[]` |

`luc` là số giây tính từ đầu cảnh, dùng để khớp với lời đọc. Để `luc` bằng 0 thì các mục tự chia đều.

### Đặt điểm trên bản đồ

Toạ độ tính bằng % chiều rộng (x) và % chiều cao (y) của ảnh bản đồ. Với bản đồ Việt Nam có sẵn (`thuvien/ban_do_viet_nam_01.jpg`, phủ 101.8–110.3°E và 24–8°N):

```
x% = (kinh độ − 101.8) / 8.5 × 100      y% = (24 − vĩ độ) / 16 × 100
```

Ví dụ: Hà Nội (21.03°N, 105.85°E) → x 47.6, y 18.6. Với bản đồ khác, mở dự án bằng `npm run dev`, chỉnh x/y trên bảng Props và xem điểm di chuyển ngay. `muiTen.mau` nhận `vang` (ta), `do` (địch) hoặc `trang`. `cong` từ −1 tới 1 quyết định độ cong của mũi tên.

## Ảnh

Tất cả ảnh nằm trong `public/thuvien/`. Nguồn từng ảnh được ghi trong `public/thuvien/nguon.json`.

**Ảnh tư liệu từ Wikimedia Commons** (public domain / CC):

```
python tools/lay_anh_wiki.py tim "Dien Bien Phu 1954" 30     # tải ứng viên vào _ungvien/, mở _ungvien/xem.html để xem
python tools/lay_anh_wiki.py chon 3 7 12 --ten dien_bien_phu # chuyển ảnh đã chọn vào thư viện
python tools/lay_anh_wiki.py nguon                           # in phần ghi nguồn để dán vào mô tả YouTube
```

Tìm bằng tiếng Anh thường ra nhiều ảnh hơn. Ảnh có giấy phép CC BY hoặc CC BY-SA **bắt buộc ghi tên tác giả**, nên hãy dán kết quả lệnh `nguon` vào mô tả video.

**Ảnh trên mạng, ảnh AI, ảnh tự chuẩn bị:** chép file vào `public/thuvien/` rồi chạy `python tools/cap_nhat_thuvien.py`. Ảnh mới sẽ được thêm vào `nguon.json` với nguồn “chưa ghi”; mở file đó để điền nguồn. Ảnh lấy từ báo hoặc trang khác thường có bản quyền, dễ bị YouTube đánh gậy. Nên ưu tiên ảnh Commons, ảnh AI tự tạo hoặc ảnh bạn có quyền dùng. Ảnh AI không phải tư liệu thật, nên đừng dùng cảnh `tuLieu` cho ảnh AI.

## Chỉnh và xuất video

```
npm run dev                     # mở Remotion Studio để xem và chỉnh trên bảng Props
npx remotion render Tap01 "D:/SuThatLichSu/out/Tap01.mp4" --codec=h264 --crf=20 --x264-preset=veryfast --concurrency=8 --gl=angle
```

Ổ C gần đầy, nên hãy đặt `TEMP`/`TMP` sang ổ D trước khi render (`$env:TEMP="D:\tmp_render"; $env:TMP="D:\tmp_render"`). Hiệu ứng hạt phim làm render chậm hơn một chút. Nếu cần nhanh hơn, giảm `phimCu` hoặc đặt về 0.
