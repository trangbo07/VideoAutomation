import type { VideoProps } from "../video/schema";

/**
 * Tập mẫu: Trận Bạch Đằng năm 938. Có đủ 10 loại cảnh để xem thử.
 * Tập mẫu chưa có giọng đọc, vì vậy độ dài cố định 92 giây. Tập thật để thoiLuong = 0, độ dài sẽ tự lấy theo file giọng.
 *
 * Toạ độ bản đồ (bản đồ Vietnam location map: 101.8–110.3°E, 24–8°N):
 *   x% = (kinh độ − 101.8) / 8.5 × 100     y% = (24 − vĩ độ) / 16 × 100
 */
const BD = "thuvien/ban_do_viet_nam_01.jpg";
const DAI_LA = { x: 47.6, y: 18.6 }; // Hà Nội ngày nay
const AI_CHAU = { x: 46.8, y: 26.3 }; // Thanh Hoá
const BACH_DANG = { x: 58.8, y: 19.7 }; // cửa sông Bạch Đằng
const NGOAI_BIEN = { x: 78, y: 24 };

export const tapMau: VideoProps = {
  tenKenh: "SỰ THẬT LỊCH SỬ",
  tenTap: "Trận Bạch Đằng 938",
  thoiLuong: 92,
  giongDoc: "",
  amLuongGiong: 1,
  nhacNen: "",
  amLuongNhac: 0.15,
  phuDe: { file: "", hien: false, coChu: 48, cachDay: 80 },
  phimCu: 0.7,
  canh: {
    ketThuc: 92,
    chayTungChu: false,
    ds: [
      { loai: "mo", batDau: 0, anhNen: "thuvien/bach_dang_01.jpg", nhan: "Sự thật lịch sử", tieuDe: ["Trận Bạch Đằng", "khép lại nghìn năm Bắc thuộc"], phu: "Năm 938" },
      { loai: "soLieu", batDau: 7, anhNen: "thuvien/trong_dong_02.jpg", so: 1000, truocSo: "Hơn", donVi: "năm", nhan: "dưới ách đô hộ của các triều đại phương Bắc" },
      {
        loai: "dongThoiGian",
        batDau: 14,
        anhNen: "thuvien/hai_ba_trung_01.jpg",
        tieuDe: "Những cuộc khởi nghĩa giành độc lập",
        suKien: [
          { nam: "40", ten: "Hai Bà Trưng khởi nghĩa", noiBat: false, luc: 0 },
          { nam: "544", ten: "Lý Bí lập nước Vạn Xuân", noiBat: false, luc: 0 },
          { nam: "905", ten: "Khúc Thừa Dụ giành quyền tự chủ", noiBat: false, luc: 0 },
          { nam: "938", ten: "Chiến thắng Bạch Đằng", noiBat: true, luc: 0 },
          { nam: "939", ten: "Ngô Quyền xưng vương, đóng đô ở Cổ Loa", noiBat: false, luc: 0 },
        ],
      },
      {
        loai: "nhanVat",
        batDau: 27,
        anh: "thuvien/tuong_ngo_quyen_01.jpg",
        ten: "Ngô Quyền",
        namSinhMat: "897 – 944",
        chucDanh: "Người mở đầu thời kỳ độc lập",
        thongTin: ["Quê Đường Lâm (Sơn Tây, Hà Nội ngày nay)", "Con rể của Dương Đình Nghệ", "Năm 939 xưng vương, đóng đô ở Cổ Loa"],
      },
      { loai: "moc", batDau: 36, anhNen: "thuvien/cua_song_bach_dang_01.jpg", demTu: 880, nam: 938, tieuDe: "Quân Nam Hán kéo vào sông Bạch Đằng", diaDiem: "Cửa sông Bạch Đằng" },
      {
        loai: "banDo",
        batDau: 43,
        anh: BD,
        tieuDe: "Hai cánh quân hướng về Bạch Đằng",
        locCu: true,
        zoom: { x: 60, y: 22, muc: 5 },
        diem: [
          { ...AI_CHAU, ten: "Ái Châu", ben: "phai", luc: 0 },
          { ...DAI_LA, ten: "Đại La", ben: "trai", luc: 0 },
          { ...BACH_DANG, ten: "Sông Bạch Đằng", ben: "tren", luc: 0 },
        ],
        muiTen: [
          { tuX: AI_CHAU.x, tuY: AI_CHAU.y, denX: DAI_LA.x, denY: DAI_LA.y, cong: 0.25, mau: "vang", luc: 0 },
          { tuX: DAI_LA.x, tuY: DAI_LA.y, denX: BACH_DANG.x - 0.8, denY: BACH_DANG.y, cong: -0.2, mau: "vang", luc: 0 },
          { tuX: NGOAI_BIEN.x, tuY: NGOAI_BIEN.y, denX: BACH_DANG.x + 0.8, denY: BACH_DANG.y + 0.3, cong: 0.3, mau: "do", luc: 0 },
        ],
      },
      {
        loai: "trich",
        batDau: 56,
        anhNen: "thuvien/cua_song_bach_dang_01.jpg",
        loi: "Hoằng Tháo là đứa trẻ khờ dại, đem quân từ xa đến, quân lính còn mỏi mệt.",
        tacGia: "Ngô Quyền · Đại Việt sử ký toàn thư",
      },
      { loai: "chuong", batDau: 64, anhNen: "thuvien/bach_dang_02.jpg", so: "01", tieuDe: "Kế cắm cọc trên sông", thoiKy: "Năm 938" },
      { loai: "anh", batDau: 69, anh: "thuvien/bach_dang_01.jpg", chu: "Cọc gỗ đầu bịt sắt, cắm ngầm dưới lòng sông.", loc: "goc" },
      {
        loai: "tuLieu",
        batDau: 75,
        anh: "thuvien/tranh_ngo_quyen_01.jpg",
        chuThich: "Tranh dân gian: Ngô Quyền đại phá quân Nam Hán trên sông Bạch Đằng",
        nguon: "Wikimedia Commons",
        nam: "938",
        hienMau: false,
      },
      {
        loai: "tuLieu",
        batDau: 82,
        anh: "thuvien/bach_dang_03.jpg",
        chuThich: "350 năm sau, Trần Hưng Đạo dùng lại kế cắm cọc để đánh quân Nguyên Mông",
        nguon: "Tranh tái hiện trận Bạch Đằng 1288 · Wikimedia Commons",
        nam: "1288",
        hienMau: true,
      },
    ],
  },
  anhLap: { danhSach: [], giayMoiAnh: 9, loc: "cu" },
};
