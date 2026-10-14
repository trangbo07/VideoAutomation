# Hướng dẫn cho AI (Antigravity) — tạo tập video Sự Thật Lịch Sử

Bạn (AI) KHÔNG sửa mã nguồn. Bạn chỉ làm 3 việc:
1. Chuẩn bị tư liệu cho một tập trong thư mục `du_an/<ten_tap>/`.
2. Viết file `tap.json` mô tả tập đó.
3. Chạy lệnh render: `stls render du_an/<ten_tap>/tap.json out/<ten_tap>.mp4`

Không có cách tạo video nào khác. Lệnh `stls` cần giấy phép còn hạn; nếu báo
"Giấy phép không hợp lệ" hãy dừng lại và báo cho người dùng, ĐỪNG tìm cách vòng qua.

## Bố cục thư mục một tập

```
du_an/<ten_tap>/tap.json      ← bạn viết file này
public/<ten_tap>/giong.mp3    ← giọng đọc (bắt buộc)
public/<ten_tap>/sub.srt      ← phụ đề
public/<ten_tap>/nhac.mp3     ← nhạc nền (không bắt buộc)
public/thuvien/*.jpg          ← ảnh dùng chung
```

Mọi đường dẫn trong `tap.json` tính từ thư mục `public/`, ví dụ `"tap01/giong.mp3"`,
`"thuvien/le_loi_01.jpg"`. Ảnh bạn tự vẽ/chuẩn bị thì lưu vào `public/thuvien/`.

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
