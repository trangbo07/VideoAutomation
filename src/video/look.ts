import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadBVP } from "@remotion/google-fonts/BeVietnamPro";
import { Easing, interpolate, staticFile } from "remotion";

const sub = ["vietnamese", "latin", "latin-ext"] as const;
const pf = loadPlayfair("normal", { weights: ["700", "900"], subsets: [...sub] });
const pfI = loadPlayfair("italic", { weights: ["500", "700"], subsets: [...sub] });
const osw = loadOswald("normal", { weights: ["400", "600"], subsets: [...sub] });
const bvp = loadBVP("normal", { weights: ["500", "600", "700"], subsets: [...sub] });

/** Chữ có chân cổ điển cho tiêu đề, tên nhân vật */
export const SERIF = pf.fontFamily;
export const SERIF_I = pfI.fontFamily;
/** Chữ đứng hẹp cho năm, con số, nhãn */
export const COND = osw.fontFamily;
/** Chữ thân, phụ đề */
export const SANS = bvp.fontFamily;

/** Bảng màu tư liệu: giấy cũ, vàng đồng, đỏ son */
export const K = {
  ink: "#0B0907",
  paper: "#EFE3C8",
  paperDark: "#C9B48A",
  gold: "#D9A84E",
  red: "#B8392B",
  white: "#FFFFFF",
  mute: "rgba(239,227,200,0.72)",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const img = (n: string) => staticFile(n);

export const ramp = (t: number, a: number, b: number, ease = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing: ease });

/** Độ hiện của cảnh: vào/ra mờ dần */
export const fade = (t: number, dur: number, inD = 1, outD = 1) =>
  Math.min(ramp(t, 0, inD), 1 - ramp(t, dur - outD, dur, Easing.in(Easing.quad)));

/** Máy quay trôi chậm (Ken Burns): mỗi ảnh một hướng khác nhau */
export const drift = (p: number, seed: number) => {
  const dir = ((seed % 4) + 4) % 4;
  const zIn = dir % 2 === 0;
  const s = zIn ? 1.05 + 0.12 * p : 1.17 - 0.12 * p;
  const dx = [-1, 1, 0.7, -0.7][dir] * 50 * (p - 0.5);
  const dy = [0.5, -0.5, -1, 1][dir] * 24 * (p - 0.5);
  return `scale(${s}) translate(${dx}px, ${dy}px)`;
};

/** Bộ lọc màu ảnh */
export const LOC = {
  goc: "brightness(0.9) contrast(1.05)",
  cu: "sepia(0.55) contrast(1.1) brightness(0.85) saturate(0.8)",
  denTrang: "grayscale(1) contrast(1.15) brightness(0.88)",
} as const;
export type Loc = keyof typeof LOC;

/** 1000000 -> "1.000.000"; năm âm -> "208 TCN" */
export const soVN = (n: number) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const namVN = (n: number) => (n < 0 ? `${Math.round(-n)} TCN` : String(Math.round(n)));
