import type { VideoProps } from "../video/schema";

/**
 * Tập 1 (bản dựng thử): đoạn kết, 72 giây đầu của giọng đọc Tap1 (câu phụ đề 1–6).
 * giong_thu.mp3 / sub_thu.srt là bản đã cắt tới 72,1 giây; dựng cả tập thì đổi về giong.mp3 / sub.srt và thoiLuong = 0.
 *
 * Toạ độ bản đồ Việt Nam: x% = (kinh độ − 101.8) / 8.5 × 100, y% = (24 − vĩ độ) / 16 × 100
 */
const BD = "thuvien/ban_do_viet_nam_01.jpg";
const THO_XUAN = { x: 42.9, y: 25.4 }; // 19.93°N, 105.45°E
const THANG_LONG = { x: 47.6, y: 18.6 };

export const tap01: VideoProps = {
  tenKenh: "SỰ THẬT LỊCH SỬ",
  tenTap: "Hồ sơ Lam Sơn",
  thoiLuong: 76,
  giongDoc: "tap01/giong_thu.mp3",
  amLuongGiong: 1,
  nhacNen: "tap01/nhac.mp3",
  amLuongNhac: 0.18,
  phuDe: { file: "tap01/sub_thu.srt", hien: true, coChu: 46, cachDay: 70 },
  phimCu: 0.6,
  canh: {
    ketThuc: 76,
    chayTungChu: true,
    ds: [
      { loai: "mo", batDau: 0, anhNen: "thuvien/lam_kinh_01.jpg", nhan: "Sự thật lịch sử", tieuDe: ["Khởi nghĩa Lam Sơn", "những hy sinh thầm lặng"], phu: "1418 – 1427" },
      {
        loai: "banDo",
        batDau: 5.6,
        anh: BD,
        tieuDe: "Thọ Xuân, xứ Thanh hôm nay",
        locCu: true,
        zoom: { x: 45, y: 23, muc: 4.5 },
        diem: [
          { ...THANG_LONG, ten: "Thăng Long", ben: "phai", luc: 2.2 },
          { ...THO_XUAN, ten: "Thọ Xuân · Thanh Hoá", ben: "trai", luc: 4.6 },
        ],
        muiTen: [{ tuX: THANG_LONG.x, tuY: THANG_LONG.y, denX: THO_XUAN.x + 0.3, denY: THO_XUAN.y - 0.5, cong: 0.3, mau: "vang", luc: 5.4 }],
      },
      { loai: "anh", batDau: 14.6, anh: "thuvien/huong_den_02.jpg", chu: "Thời gian chưa từng lãng quên một ai.", loc: "goc" },
      { loai: "anh", batDau: 20.3, anh: "thuvien/huong_den_01.jpg", chu: "Hoàng hậu Phạm Thị Ngọc Trần", loc: "cu" },
      { loai: "anh", batDau: 23.8, anh: "thuvien/bia_co_01.jpg", chu: "Đền Bà Am · làng Hội Hiền", loc: "cu" },
      { loai: "soLieu", batDau: 28.4, anhNen: "thuvien/lam_kinh_01.jpg", so: 600, truocSo: "Hơn", donVi: "năm", nhan: "nhân dân đời đời hương khói" },
      {
        loai: "dongThoiGian",
        batDau: 36.1,
        anhNen: "thuvien/toan_thu_01.jpg",
        tieuDe: "Hành trình bốn chương",
        suKien: [
          { nam: "01", ten: "Lời thề tế thần đẫm nước mắt", noiBat: false, luc: 3.2 },
          { nam: "02", ten: "Lễ tế Hoàng hậu vắng bóng cô dâu", noiBat: false, luc: 6.2 },
          { nam: "03", ten: "Sự thật sau những giấc mộng chiến lược", noiBat: false, luc: 9.6 },
          { nam: "04", ten: "Lời giải mã đầy trăn trở", noiBat: true, luc: 12.8 },
        ],
      },
      { loai: "anh", batDau: 53.55, anh: "thuvien/lang_le_loi_01.jpg", chu: "Khắc bằng máu và nước mắt", loc: "cu" },
      { loai: "moc", batDau: 58.0, anhNen: "thuvien/le_loi_02.jpg", demTu: 1418, nam: 1428, tieuDe: "Ngai vàng vương triều Hậu Lê", diaDiem: "Đông Kinh" },
      { loai: "anh", batDau: 63.6, anh: "thuvien/le_loi_01.jpg", chu: "Đúc bằng xương máu nghĩa sĩ", loc: "denTrang" },
      {
        loai: "trich",
        batDau: 66.9,
        anhNen: "thuvien/song_lam_02.jpg",
        loi: "Thanh xuân, danh tiết và chính sinh mạng của những người phụ nữ thầm lặng đứng sau lưng thời đại.",
        tacGia: "Những người phụ nữ của Lam Sơn",
      },
    ],
  },
  anhLap: { danhSach: [], giayMoiAnh: 9, loc: "cu" },
};
