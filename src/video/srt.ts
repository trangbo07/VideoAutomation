import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

export type Cue = { start: number; end: number; text: string };

const toSec = (s: string) => {
  const m = s.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 10 ** m[4].length;
};

const MAX_CHU = 95; // tối đa ~2 dòng trên màn hình

/** Cắt một đoạn quá dài tại dấu phẩy / gạch ngang gần giữa nhất */
const catDai = (s: string): string[] => {
  if (s.length <= MAX_CHU) return [s];
  const mid = s.length / 2;
  let best = -1;
  const re = /[,;:—–]\s/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const at = m.index + 1;
    if (best < 0 || Math.abs(at - mid) < Math.abs(best - mid)) best = at;
  }
  if (best < 15 || best > s.length - 15) {
    // không có dấu phù hợp: cắt ở khoảng trắng gần giữa
    best = s.lastIndexOf(" ", Math.round(mid));
    if (best <= 0) return [s];
  }
  return [...catDai(s.slice(0, best).trim()), ...catDai(s.slice(best).trim())];
};

/** Tách một đoạn phụ đề dài thành từng câu, chia thời gian theo số ký tự */
const tachCau = (c: Cue): Cue[] => {
  if (c.text.length <= MAX_CHU) return [c];
  // cắt sau . ? ! … (kèm dấu ngoặc kép đóng nếu có)
  const raw = c.text.match(/[^.?!…]+(?:[.?!…]+["”»']?|$)\s*/g) ?? [c.text];
  const merged: string[] = [];
  for (const piece of raw.map((x) => x.trim()).filter(Boolean)) {
    const last = merged[merged.length - 1];
    const tiepCau = piece[0] !== piece[0].toUpperCase(); // "sống… hay" chưa hết câu
    if (last && (tiepCau || ((last.length < 25 || piece.length < 12) && last.length + piece.length + 1 <= MAX_CHU))) merged[merged.length - 1] = last + " " + piece;
    else merged.push(piece);
  }
  const parts = merged.flatMap(catDai);
  const total = parts.reduce((a, p) => a + p.length, 0);
  let t = c.start;
  return parts.map((text) => {
    const d = ((c.end - c.start) * text.length) / total;
    const cue = { start: t, end: t + d, text };
    t += d;
    return cue;
  });
};

/** Đọc file .srt -> danh sách câu có mốc thời gian */
export const parseSrt = (raw: string): Cue[] =>
  raw
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").filter((l) => l.trim() !== "");
      const i = lines.findIndex((l) => l.includes("-->"));
      if (i < 0) return null;
      const [a, b] = lines[i].split("-->");
      const text = lines
        .slice(i + 1)
        .join(" ")
        .replace(/<[^>]+>/g, "")
        .replace(/\{[^}]+\}/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return text ? { start: toSec(a), end: toSec(b), text } : null;
    })
    .filter((c): c is Cue => c !== null)
    .sort((x, y) => x.start - y.start)
    .flatMap(tachCau);

/** Tải phụ đề một lần khi dựng video */
export const useSrt = (file: string): Cue[] => {
  const [cues, setCues] = useState<Cue[]>([]);
  const [handle] = useState(() => (file ? delayRender("Đọc phụ đề " + file) : null));
  useEffect(() => {
    if (!file || handle === null) return;
    fetch(staticFile(file))
      .then((r) => {
        if (!r.ok) throw new Error("Không đọc được phụ đề: " + file);
        return r.text();
      })
      .then((txt) => {
        setCues(parseSrt(txt));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [file, handle]);
  return cues;
};
