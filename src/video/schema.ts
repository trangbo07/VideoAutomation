import { z } from "zod";

/*
 * Mọi thứ ở đây hiện trên bảng "Props" của Remotion Studio để chỉnh trực tiếp.
 * Đường dẫn file tính từ thư mục public/ (vd. "tap01/giong.mp3", "thuvien/co_loa_01.jpg").
 * Thời gian tính bằng giây. Toạ độ trên ảnh/bản đồ tính bằng % (0–100).
 */

const t0 = z.number().min(0).max(10800);
const pct = z.number().min(-20).max(120);
/** giây tính từ đầu cảnh; 0 = tự chia đều */
const luc = z.number().min(0).max(600);
const loc = z.enum(["goc", "cu", "denTrang"]);

/** Màn mở đầu: nhãn nhỏ + tiêu đề lớn + dòng phụ */
const mo = z.object({
  loai: z.literal("mo"),
  batDau: t0,
  anhNen: z.string(),
  nhan: z.string(),
  tieuDe: z.array(z.string()),
  phu: z.string(),
});

/** Ảnh tràn khung, có thể kèm một câu chữ lớn */
const anh = z.object({
  loai: z.literal("anh"),
  batDau: t0,
  anh: z.string(),
  chu: z.string(),
  loc,
});

/** Ảnh tư liệu: khung ảnh in cũ trên nền mờ, chú thích + nguồn, dấu năm */
const tuLieu = z.object({
  loai: z.literal("tuLieu"),
  batDau: t0,
  anh: z.string(),
  chuThich: z.string(),
  nguon: z.string(),
  nam: z.string(),
  /** ảnh đen trắng hiện màu dần */
  hienMau: z.boolean(),
});

/** Trích dẫn / lời người xưa trên nền ảnh mờ */
const trich = z.object({
  loai: z.literal("trich"),
  batDau: t0,
  anhNen: z.string(),
  loi: z.string(),
  tacGia: z.string(),
});

/** Tiêu đề một phần / chương */
const chuong = z.object({
  loai: z.literal("chuong"),
  batDau: t0,
  anhNen: z.string(),
  so: z.string(),
  tieuDe: z.string(),
  thoiKy: z.string(),
});

/** Mốc năm lớn đếm chạy (năm âm = trước Công nguyên) */
const moc = z.object({
  loai: z.literal("moc"),
  batDau: t0,
  anhNen: z.string(),
  demTu: z.number().min(-5000).max(3000),
  nam: z.number().min(-5000).max(3000),
  tieuDe: z.string(),
  diaDiem: z.string(),
});

/** Con số lớn đếm chạy: quân số, thương vong, diện tích... */
const soLieu = z.object({
  loai: z.literal("soLieu"),
  batDau: t0,
  anhNen: z.string(),
  so: z.number().min(0),
  truocSo: z.string(),
  donVi: z.string(),
  nhan: z.string(),
});

/** Dòng thời gian: các mốc lần lượt hiện, máy quay trượt theo */
const dongThoiGian = z.object({
  loai: z.literal("dongThoiGian"),
  batDau: t0,
  anhNen: z.string(),
  tieuDe: z.string(),
  suKien: z.array(z.object({ nam: z.string(), ten: z.string(), noiBat: z.boolean(), luc })),
});

/** Bản đồ: máy quay zoom vào vùng, điểm nhấp nháy, mũi tên hành quân vẽ dần */
const banDo = z.object({
  loai: z.literal("banDo"),
  batDau: t0,
  anh: z.string(),
  tieuDe: z.string(),
  locCu: z.boolean(),
  /** vùng zoom tới: tâm (x,y) và độ phóng (1 = thấy cả bản đồ) */
  zoom: z.object({ x: pct, y: pct, muc: z.number().min(1).max(12) }),
  diem: z.array(z.object({ x: pct, y: pct, ten: z.string(), ben: z.enum(["phai", "trai", "tren", "duoi"]), luc })),
  muiTen: z.array(
    z.object({
      tuX: pct,
      tuY: pct,
      denX: pct,
      denY: pct,
      /** độ cong: âm cong một phía, dương cong phía kia */
      cong: z.number().min(-1).max(1),
      mau: z.enum(["vang", "do", "trang"]),
      luc,
    }),
  ),
});

/** Thẻ nhân vật: chân dung trong khung + tên, năm sinh mất, chức danh, vài dòng tóm tắt */
const nhanVat = z.object({
  loai: z.literal("nhanVat"),
  batDau: t0,
  anh: z.string(),
  ten: z.string(),
  namSinhMat: z.string(),
  chucDanh: z.string(),
  thongTin: z.array(z.string()),
});

export const canhDau = z.discriminatedUnion("loai", [mo, anh, tuLieu, trich, chuong, moc, soLieu, dongThoiGian, banDo, nhanVat]);
export type CanhDau = z.infer<typeof canhDau>;
export type Loai = CanhDau["loai"];

export const videoSchema = z.object({
  tenKenh: z.string(),
  tenTap: z.string(),
  /** 0 = tự lấy theo độ dài file giọng đọc */
  thoiLuong: z.number().min(0).max(10800),
  giongDoc: z.string(),
  amLuongGiong: z.number().min(0).max(2),
  nhacNen: z.string(),
  amLuongNhac: z.number().min(0).max(1),
  phuDe: z.object({
    file: z.string(),
    hien: z.boolean(),
    coChu: z.number().min(24).max(90),
    cachDay: z.number().min(0).max(400),
  }),
  /** độ đậm hiệu ứng phim cũ (hạt, vết xước, nhấp nháy): 0 = tắt */
  phimCu: z.number().min(0).max(1),
  canh: z.object({
    /** giây kết thúc phần dựng cảnh (sau đó chuyển sang ảnh lặp). Đặt bằng độ dài video nếu dựng cả video */
    ketThuc: t0,
    /** phụ đề chạy từng chữ trong phần dựng cảnh */
    chayTungChu: z.boolean(),
    ds: z.array(canhDau),
  }),
  anhLap: z.object({
    /** để trống = dùng toàn bộ thư viện public/thuvien */
    danhSach: z.array(z.string()),
    giayMoiAnh: z.number().min(3).max(60),
    loc,
  }),
});

export type VideoProps = z.infer<typeof videoSchema>;
