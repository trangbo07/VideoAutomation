# Hướng dẫn cho AI (Antigravity) — tạo tập video Sự Thật Lịch Sử

Bạn (AI) KHÔNG sửa mã nguồn.

## Ai lo phần nào

- **Khách cung cấp:** file **giọng đọc `giong.mp3`** và **phụ đề `sub.srt`**
  (đặt trong `public/<ten_tap>/`). Đây là đầu vào của khách, bạn KHÔNG tạo hai file này.
- **Việc của bạn (AI):**
  1. **Tìm ảnh** phù hợp với nội dung tập — tải từ Internet (ưu tiên ảnh miễn phí bản quyền:
     Wikimedia Commons, public domain) **hoặc dùng ảnh khách đưa** — lưu vào `public/thuvien/`.
  2. **Đọc phụ đề `sub.srt`** để nắm nội dung, rồi **viết `tap.json`** dựng cảnh khớp với lời đọc.
  3. **Chạy render:** `stls render du_an/<ten_tap>/tap.json out/<ten_tap>.mp4`

Lệnh `stls` cần giấy phép còn hạn; nếu báo "Giấy phép không hợp lệ" hãy dừng và báo người dùng,
ĐỪNG tìm cách vòng qua.

## Bố cục thư mục một tập

```
du_an/<ten_tap>/tap.json      ← BẠN viết (dựng cảnh)
public/<ten_tap>/giong.mp3    ← KHÁCH gửi (giọng đọc; video dài theo file này) — bắt buộc
public/<ten_tap>/sub.srt      ← KHÁCH gửi (phụ đề)
public/<ten_tap>/nhac.mp3     ← nhạc nền (không bắt buộc)
public/thuvien/*.jpg          ← BẠN tải ảnh về / ảnh khách cấp
```

Mọi đường dẫn trong `tap.json` tính từ thư mục `public/`, ví dụ `"tap01/giong.mp3"`,
`"thuvien/le_loi_01.jpg"`. Nếu thiếu `sub.srt` thì video vẫn render nhưng không có phụ đề.
Căn thời gian các cảnh (`batDau`, `luc`) theo mốc thời gian trong `sub.srt` để ảnh khớp lời đọc.

## Cấu trúc tap.json

Trường gốc: `tenKenh`, `tenTap`, `thoiLuong` (0 = tự lấy theo độ dài giọng đọc),
`giongDoc`, `amLuongGiong` (0–2), `nhacNen`, `amLuongNhac` (0–1),
`phuDe {file, hien, coChu 24–90, cachDay}`, `phimCu` (0–1, độ đậm hiệu ứng phim cũ),
`canh {ketThuc, chayTungChu, ds[]}`, `anhLap {danhSach[], giayMoiAnh 3–60, loc}`.

Mỗi phần tử `canh.ds[]` có `loai` và `batDau` (giây), cộng các trường riêng:

| loai | Trường riêng |
|---|---|
| `mo` | `anhNen`, `nhan`, `tieuDe[]`, `phu` |
| `anh` | `anh`, `chu`, `loc` ("goc"/"cu"/"denTrang") |
| `tuLieu` | `anh`, `chuThich`, `nguon`, `nam`, `hienMau` (bool) |
| `trich` | `anhNen`, `loi`, `tacGia` |
| `chuong` | `anhNen`, `so`, `tieuDe`, `thoiKy` |
| `moc` | `anhNen`, `demTu`, `nam` (âm = TCN), `tieuDe`, `diaDiem` |
| `soLieu` | `anhNen`, `so`, `truocSo`, `donVi`, `nhan` |
| `dongThoiGian` | `anhNen`, `tieuDe`, `suKien[]`: `nam`,`ten`,`noiBat`,`luc` |
| `banDo` | `anh`, `tieuDe`, `locCu`, `zoom{x,y,muc}`, `diem[]`, `muiTen[]` |
| `nhanVat` | `anh`, `ten`, `namSinhMat`, `chucDanh`, `thongTin[]` |

- `luc` = số giây tính từ đầu cảnh (0 = tự chia đều), dùng khớp với lời đọc.
- Toạ độ bản đồ tính bằng %: với `ban_do_viet_nam_01.jpg`,
  `x% = (kinh_độ − 101.8) / 8.5 × 100`, `y% = (24 − vĩ_độ) / 16 × 100`.
- `muiTen.mau`: "vang" (ta) / "do" (địch) / "trang". `cong` từ −1 đến 1.

Xem `du_an_mau/tap01/tap.json` làm mẫu đầy đủ.

## Render

```
stls render du_an/<ten_tap>/tap.json out/<ten_tap>.mp4
```
