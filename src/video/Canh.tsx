import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate } from "remotion";
import { clamp, COND, fade, img, K, LOC, Loc, namVN, ramp, SANS, SERIF, SERIF_I, soVN } from "./look";
import { Photo } from "./Phim";

type SP = { t: number; dur: number; seed: number };
const prog = (t: number, dur: number) => interpolate(t, [0, dur], [0, 1], clamp);
const shadow = "0 4px 30px rgba(0,0,0,0.7)";

/** Các dòng chữ hiện dần, mờ -> rõ */
const Lines: React.FC<{ lines: string[]; t: number; delay: number; size: number; accentLast?: boolean; align?: "left" | "center" }> = ({
  lines,
  t,
  delay,
  size,
  accentLast = true,
  align = "center",
}) => (
  <div style={{ textAlign: align }}>
    {lines.map((l, i) => {
      const p = ramp(t, delay + i * 0.35, delay + i * 0.35 + 1.4);
      const last = accentLast && i === lines.length - 1 && lines.length > 1;
      return (
        <div
          key={i}
          style={{
            fontFamily: last ? SERIF_I : SERIF,
            fontWeight: last ? 500 : 900,
            fontSize: last ? size * 0.78 : size,
            lineHeight: 1.15,
            color: last ? K.gold : K.paper,
            opacity: p,
            transform: `translateY(${(1 - p) * 24}px)`,
            filter: `blur(${(1 - p) * 6}px)`,
            textShadow: shadow,
          }}
        >
          {l}
        </div>
      );
    })}
  </div>
);

/** Nhãn nhỏ chữ hoa giãn rộng */
const Tag: React.FC<{ children: React.ReactNode; o: number; color?: string; size?: number }> = ({ children, o, color = K.gold, size = 30 }) => (
  <div style={{ fontFamily: COND, fontWeight: 600, fontSize: size, letterSpacing: size * 0.35, color, opacity: o, textTransform: "uppercase", textShadow: shadow }}>{children}</div>
);

/** Tiêu đề góc trái trên của cảnh dòng thời gian / bản đồ (nằm dưới logo kênh) */
const SceneTitle: React.FC<{ t: number; label: string; title: string }> = ({ t, label, title }) => {
  const k = ramp(t, 0.3, 1.1);
  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 0,
        padding: "18px 60px 22px 140px",
        background: "linear-gradient(90deg, rgba(11,9,7,0.85) 60%, transparent)",
        opacity: k,
        transform: `translateX(${(1 - k) * -30}px)`,
      }}
    >
      <Tag o={1} size={24}>
        {label}
      </Tag>
      <div style={{ marginTop: 6, fontFamily: SERIF, fontWeight: 900, fontSize: 58, color: K.paper, textShadow: shadow }}>{title}</div>
    </div>
  );
};

const Rule: React.FC<{ w: number; m?: string }> = ({ w, m = "28px auto 32px" }) => (
  <div style={{ width: w, height: 2, margin: m, background: `linear-gradient(90deg, transparent, ${K.gold}, transparent)` }} />
);

/* ------------------------------------------------------------------ */
/* Màn mở đầu: khung viền vàng vẽ dần quanh tiêu đề                    */
/* ------------------------------------------------------------------ */
export const Opening: React.FC<SP & { bg: string; tag: string; lines: string[]; sub: string }> = ({ t, dur, seed, bg, tag, lines, sub }) => {
  const frameP = ramp(t, 0.4, 2.6, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur, 1.5, 1.2) }}>
      <Photo src={bg} p={prog(t, dur)} seed={seed} loc="cu" filter="brightness(0.45)" />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <rect x="70" y="70" width="1780" height="940" fill="none" stroke={K.gold} strokeOpacity={0.55} strokeWidth={2} pathLength={1} strokeDasharray={`${frameP} 1`} />
        <rect x="84" y="84" width="1752" height="912" fill="none" stroke={K.gold} strokeOpacity={0.25} strokeWidth={1} pathLength={1} strokeDasharray={`${frameP} 1`} />
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 200px 80px" }}>
        <Tag o={ramp(t, 0.3, 1.3)}>{tag}</Tag>
        <Rule w={320 * ramp(t, 0.6, 2.0)} />
        <Lines lines={lines} t={t} delay={0.9} size={lines.join("").length > 40 ? 96 : 120} />
        <div style={{ marginTop: 34, fontFamily: SERIF_I, fontWeight: 500, fontSize: 38, color: K.mute, opacity: ramp(t, 2.2, 3.2), textShadow: shadow }}>{sub}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Ảnh tràn khung + câu chữ                                            */
/* ------------------------------------------------------------------ */
export const Still: React.FC<SP & { src: string; text: string; loc: Loc }> = ({ t, dur, seed, src, text, loc }) => (
  <AbsoluteFill style={{ opacity: fade(t, dur) }}>
    <Photo src={src} p={prog(t, dur)} seed={seed} loc={loc} filter={text ? "brightness(0.6)" : undefined} />
    {text ? (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 220px 160px" }}>
        <Lines lines={[text]} t={t} delay={0.6} size={text.length > 60 ? 64 : 82} accentLast={false} />
      </AbsoluteFill>
    ) : null}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Ảnh tư liệu: bản in cũ trên nền mờ, dấu năm đỏ, chú thích           */
/* ------------------------------------------------------------------ */
export const Archive: React.FC<SP & { src: string; caption: string; source: string; year: string; colorize: boolean }> = ({
  t,
  dur,
  seed,
  src,
  caption,
  source,
  year,
  colorize,
}) => {
  const p = prog(t, dur);
  const enter = ramp(t, 0, 1.4);
  const gray = colorize ? 1 - ramp(t, 1.5, 4.5, Easing.inOut(Easing.quad)) : 0;
  const filter = colorize ? `grayscale(${gray}) sepia(${0.25 + 0.35 * gray}) contrast(1.08)` : LOC.cu;
  const stamp = ramp(t, 1.1, 1.45, Easing.out(Easing.back(2)));
  const tilt = (seed % 2 ? 1 : -1) * (1.6 - 0.8 * p);
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur) }}>
      <Photo src={src} p={p} seed={seed} filter="blur(18px) brightness(0.32)" loc="cu" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
        <div
          style={{
            position: "relative",
            background: K.paper,
            padding: "18px 18px 0",
            boxShadow: "0 30px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,0,0,0.3)",
            transform: `rotate(${tilt}deg) scale(${1.06 - 0.06 * enter + 0.02 * p}) translateY(${(1 - enter) * 40}px)`,
            opacity: enter,
          }}
        >
          <div style={{ overflow: "hidden", lineHeight: 0 }}>
            <Img src={img(src)} style={{ display: "block", maxWidth: 1240, maxHeight: caption ? 620 : 720, filter, transform: `scale(${1 + 0.07 * p})` }} />
          </div>
          <div style={{ padding: caption || source ? "16px 8px 20px" : "0 0 18px", maxWidth: 1240, color: K.ink }}>
            {caption ? <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 34, lineHeight: 1.3 }}>{caption}</div> : null}
            {source ? (
              <div style={{ marginTop: 6, fontFamily: COND, fontWeight: 400, fontSize: 22, letterSpacing: 2, opacity: 0.65, textTransform: "uppercase" }}>Nguồn: {source}</div>
            ) : null}
          </div>
          {year ? (
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -40,
                padding: "6px 22px",
                border: `4px solid ${K.red}`,
                borderRadius: 8,
                fontFamily: COND,
                fontWeight: 600,
                fontSize: 56,
                letterSpacing: 4,
                color: K.red,
                background: "rgba(239,227,200,0.85)",
                opacity: stamp * 0.92,
                transform: `rotate(-9deg) scale(${1.8 - 0.8 * stamp})`,
              }}
            >
              {year}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Trích dẫn                                                           */
/* ------------------------------------------------------------------ */
export const Quote: React.FC<SP & { bg: string; text: string; author: string }> = ({ t, dur, seed, bg, text, author }) => {
  const words = text.split(" ");
  const span = Math.min(dur * 0.55, Math.max(2, words.length * 0.3));
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur) }}>
      <Photo src={bg} p={prog(t, dur)} seed={seed} loc="cu" filter="blur(6px) brightness(0.35)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 240px 140px" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 220, lineHeight: 0.6, color: K.gold, opacity: 0.85 * ramp(t, 0.2, 1.0) }}>“</div>
        <div style={{ marginTop: 30, textAlign: "center", fontFamily: SERIF_I, fontWeight: 500, fontSize: words.length > 30 ? 52 : 64, lineHeight: 1.4, color: K.paper, textShadow: shadow }}>
          {words.map((w, i) => (
            <span key={i} style={{ opacity: 0.15 + 0.85 * ramp(t, 0.6 + (i / words.length) * span, 1.1 + (i / words.length) * span) }}>
              {w}{" "}
            </span>
          ))}
        </div>
        {author ? (
          <div style={{ marginTop: 34, fontFamily: COND, fontWeight: 600, fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: K.gold, opacity: ramp(t, 0.8 + span, 1.6 + span) }}>
            — {author}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Tiêu đề phần                                                        */
/* ------------------------------------------------------------------ */
export const Part: React.FC<SP & { bg: string; num: string; title: string; era: string }> = ({ t, dur, seed, bg, num, title, era }) => (
  <AbsoluteFill style={{ opacity: fade(t, dur) }}>
    <Photo src={bg} p={prog(t, dur)} seed={seed} loc="cu" filter="brightness(0.42)" />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 100 }}>
      <Tag o={ramp(t, 0.2, 1.0)} size={28}>
        Phần
      </Tag>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 170, color: K.gold, opacity: ramp(t, 0.3, 1.3), lineHeight: 1.05, textShadow: shadow }}>{num}</div>
      <Rule w={200 * ramp(t, 0.8, 1.8)} m="18px auto 28px" />
      <Lines lines={[title]} t={t} delay={1.0} size={title.length > 30 ? 76 : 96} accentLast={false} />
      {era ? <div style={{ marginTop: 22, fontFamily: COND, fontWeight: 400, fontSize: 40, letterSpacing: 6, color: K.mute, opacity: ramp(t, 1.8, 2.6) }}>{era}</div> : null}
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Mốc năm: số năm đếm chạy rồi dừng                                   */
/* ------------------------------------------------------------------ */
export const Year: React.FC<SP & { bg: string; from: number; year: number; title: string; place: string }> = ({ t, dur, seed, bg, from, year, title, place }) => {
  const c = ramp(t, 0.4, 2.8, Easing.out(Easing.cubic));
  const v = from + (year - from) * c;
  const speed = 1 - ramp(t, 1.6, 2.8);
  const land = ramp(t, 2.7, 3.1, Easing.out(Easing.back(3)));
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur) }}>
      <Photo src={bg} p={prog(t, dur)} seed={seed} loc="cu" filter="brightness(0.38)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ width: 260 * ramp(t, 0.2, 1.6), height: 2, background: `linear-gradient(90deg, transparent, ${K.gold})` }} />
          <div
            style={{
              fontFamily: COND,
              fontWeight: 600,
              fontSize: 300,
              lineHeight: 1,
              letterSpacing: 6,
              color: K.gold,
              opacity: ramp(t, 0.2, 0.8),
              filter: `blur(${speed * 2.5}px)`,
              transform: `scale(${1 + 0.06 * land - 0.06 * ramp(t, 3.1, 3.6)})`,
              textShadow: `0 0 ${40 + 40 * land}px rgba(217,168,78,0.45), ${shadow}`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {namVN(v)}
          </div>
          <div style={{ width: 260 * ramp(t, 0.2, 1.6), height: 2, background: `linear-gradient(270deg, transparent, ${K.gold})` }} />
        </div>
        <div style={{ marginTop: 20 }}>
          <Lines lines={[title]} t={t} delay={2.9} size={title.length > 34 ? 64 : 80} accentLast={false} />
        </div>
        {place ? (
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, opacity: ramp(t, 3.4, 4.2) }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill={K.red}>
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span style={{ fontFamily: COND, fontWeight: 400, fontSize: 40, letterSpacing: 5, color: K.paper, textTransform: "uppercase" }}>{place}</span>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Con số lớn                                                          */
/* ------------------------------------------------------------------ */
export const Stat: React.FC<SP & { bg: string; value: number; before: string; unit: string; label: string }> = ({ t, dur, seed, bg, value, before, unit, label }) => {
  const c = ramp(t, 0.6, 3.0, Easing.out(Easing.poly(4)));
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur) }}>
      <Photo src={bg} p={prog(t, dur)} seed={seed} loc="denTrang" filter="brightness(0.35)" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 100 }}>
        {before ? <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 56, color: K.mute, opacity: ramp(t, 0.2, 1.0), textShadow: shadow }}>{before}</div> : null}
        <div style={{ display: "flex", alignItems: "baseline", gap: 28, opacity: ramp(t, 0.3, 0.9) }}>
          <span style={{ fontFamily: COND, fontWeight: 600, fontSize: 260, lineHeight: 1.05, color: K.paper, textShadow: shadow, fontVariantNumeric: "tabular-nums" }}>{soVN(value * c)}</span>
          {unit ? <span style={{ fontFamily: SERIF_I, fontWeight: 700, fontSize: 90, color: K.gold, textShadow: shadow }}>{unit}</span> : null}
        </div>
        <Rule w={360 * ramp(t, 2.4, 3.4)} m="16px auto 26px" />
        <Lines lines={[label]} t={t} delay={2.8} size={label.length > 40 ? 52 : 62} accentLast={false} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Dòng thời gian                                                      */
/* ------------------------------------------------------------------ */
type SuKien = { nam: string; ten: string; noiBat: boolean; luc: number };
const GAP = 520;
const LINE_Y = 560;

export const Timeline: React.FC<SP & { bg: string; title: string; events: SuKien[] }> = ({ t, dur, seed, bg, title, events }) => {
  const n = events.length;
  if (!n) return null;
  const xs = events.map((_, i) => 360 + i * GAP);
  const trackW = Math.max(1920, xs[n - 1] + 360);
  const step = Math.max(1, (dur - 3) / n);
  const at = events.map((e, i) => (e.luc > 0 ? e.luc : 1.0 + i * step));
  // điểm máy quay bám theo: chạy từ mốc này sang mốc kia khi mốc mới xuất hiện
  const keys = at.flatMap((a, i) => [a - 0.6, a + 0.6]);
  const vals = xs.flatMap((x, i) => [i ? xs[i - 1] : x, x]);
  const head = n > 1 ? interpolate(t, keys, vals, { ...clamp, easing: Easing.inOut(Easing.cubic) }) : xs[0];
  const camX = Math.min(Math.max(0, head - 960), trackW - 1920);
  const lineEnd = Math.min(trackW, head + 260 * ramp(t, 0.3, 1.2));
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur) }}>
      <Photo src={bg} p={prog(t, dur)} seed={seed} loc="cu" filter="blur(10px) brightness(0.3)" />
      <div style={{ position: "absolute", top: 0, left: 0, width: trackW, height: 1080, transform: `translateX(${-camX}px)` }}>
        <div style={{ position: "absolute", top: LINE_Y - 1, left: 0, width: lineEnd, height: 3, background: `linear-gradient(90deg, transparent, ${K.gold} 120px)` }} />
        {events.map((e, i) => {
          const p = ramp(t, at[i] - 0.2, at[i] + 0.8);
          const pop = ramp(t, at[i] - 0.2, at[i] + 0.3, Easing.out(Easing.back(3)));
          const near = 1 - Math.min(1, Math.abs(head - xs[i]) / GAP);
          const color = e.noiBat ? K.red : K.gold;
          const pulse = e.noiBat ? 0.5 + 0.5 * Math.sin((t - at[i]) * 4) : 0;
          return (
            <div key={i} style={{ position: "absolute", left: xs[i], top: LINE_Y, opacity: p }}>
              <div
                style={{
                  position: "absolute",
                  left: -16,
                  top: -16,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: color,
                  border: `4px solid ${K.paper}`,
                  transform: `scale(${pop * (1 + 0.25 * near)})`,
                  boxShadow: `0 0 ${20 + 30 * pulse}px ${color}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: -250,
                  width: 500,
                  bottom: 44,
                  textAlign: "center",
                  fontFamily: COND,
                  fontWeight: 600,
                  fontSize: 76 + 20 * near,
                  letterSpacing: 3,
                  color: e.noiBat ? K.red : K.gold,
                  textShadow: shadow,
                  transform: `translateY(${(1 - p) * 20}px)`,
                }}
              >
                {e.nam}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: -230,
                  width: 460,
                  top: 46,
                  textAlign: "center",
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 36,
                  lineHeight: 1.3,
                  color: K.paper,
                  opacity: 0.55 + 0.45 * near,
                  textShadow: shadow,
                  transform: `translateY(${(1 - p) * -16}px)`,
                }}
              >
                {e.ten}
              </div>
            </div>
          );
        })}
      </div>
      {title ? <SceneTitle t={t} label="Dòng thời gian" title={title} /> : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Bản đồ                                                              */
/* ------------------------------------------------------------------ */
type Diem = { x: number; y: number; ten: string; ben: "phai" | "trai" | "tren" | "duoi"; luc: number };
const BEN = {
  phai: { left: 28, top: -26 },
  trai: { right: 28, top: -26 },
  tren: { left: 0, bottom: 28, transform: "translateX(-50%)" },
  duoi: { left: 0, top: 28, transform: "translateX(-50%)" },
} as const;
type MuiTen = { tuX: number; tuY: number; denX: number; denY: number; cong: number; mau: "vang" | "do" | "trang"; luc: number };
const MAU = { vang: K.gold, do: "#E0453A", trang: K.paper };

/** Tỉ lệ rộng/cao thật của ảnh (để điểm % khớp đúng chỗ trên bản đồ) */
const useRatio = (src: string) => {
  const [r, setR] = useState<number | null>(null);
  const [handle] = useState(() => delayRender("Đọc kích thước bản đồ " + src));
  const done = useRef(false);
  useEffect(() => {
    const finish = (v: number) => {
      setR(v);
      if (!done.current) {
        done.current = true;
        continueRender(handle);
      }
    };
    const im = new Image();
    im.onload = () => finish(im.naturalWidth / im.naturalHeight);
    im.onerror = () => finish(16 / 9);
    im.src = img(src);
  }, [src, handle]);
  return r ?? 16 / 9;
};

type P = { x: number; y: number };
const lerp = (a: P, b: P, k: number): P => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

export const MapScene: React.FC<
  SP & { src: string; title: string; antique: boolean; zoom: { x: number; y: number; muc: number }; points: Diem[]; arrows: MuiTen[] }
> = ({ t, dur, src, title, antique, zoom, points, arrows }) => {
  const r = useRatio(src);
  const W0 = r > 16 / 9 ? 1920 : 1080 * r;
  const H0 = W0 / r;
  const zEnd = Math.min(dur * 0.45, 4.5);
  const z = ramp(t, 0.3, zEnd, Easing.inOut(Easing.cubic));
  const s = 1 + (zoom.muc - 1) * z;
  const cx = 0.5 + (zoom.x / 100 - 0.5) * z;
  const cy = 0.5 + (zoom.y / 100 - 0.5) * z;
  // thời điểm từng điểm / mũi tên: tự chia đều sau khi zoom xong, trừ khi đã đặt `luc`
  const items = points.length + arrows.length;
  const from = zEnd * 0.75;
  const step = items ? Math.max(0.6, (dur - 2 - from) / items) : 1;
  const tp = points.map((d, i) => (d.luc > 0 ? d.luc : from + i * step));
  const ta = arrows.map((a, i) => (a.luc > 0 ? a.luc : from + (points.length + i) * step));
  const px = (x: number, y: number): P => ({ x: (x / 100) * W0, y: (y / 100) * H0 });
  const filter = antique ? "sepia(0.75) contrast(1.05) brightness(0.82) hue-rotate(-8deg)" : "brightness(0.9)";
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur), background: "#2A2016" }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `${filter} blur(24px) brightness(0.5)`, transform: "scale(1.2)" }} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W0,
          height: H0,
          transformOrigin: "0 0",
          transform: `translate(${960 - cx * W0 * s}px, ${540 - cy * H0 * s}px) scale(${s})`,
        }}
      >
        <Img src={img(src)} style={{ width: W0, height: H0, filter, boxShadow: "0 0 80px rgba(0,0,0,0.6)" }} />
        <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {arrows.map((a, i) => {
            const k = ramp(t, ta[i], ta[i] + 1.8, Easing.inOut(Easing.quad));
            if (k <= 0) return null;
            const p0 = px(a.tuX, a.tuY);
            const p2 = px(a.denX, a.denY);
            const len = Math.hypot(p2.x - p0.x, p2.y - p0.y) || 1;
            const mid = lerp(p0, p2, 0.5);
            const c = { x: mid.x - ((p2.y - p0.y) / len) * a.cong * len * 0.5, y: mid.y + ((p2.x - p0.x) / len) * a.cong * len * 0.5 };
            // cắt đường cong bậc hai tại k (de Casteljau) để vẽ dần
            const q1 = lerp(p0, c, k);
            const tip = lerp(q1, lerp(c, p2, k), k);
            const dir = { x: lerp(c, p2, k).x - q1.x, y: lerp(c, p2, k).y - q1.y };
            const ang = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;
            const col = MAU[a.mau];
            const sw = 7 / s;
            const hs = 22 / s;
            return (
              <g key={i} style={{ filter: `drop-shadow(0 0 ${6 / s}px rgba(0,0,0,0.8))` }}>
                <path d={`M${p0.x},${p0.y} Q${q1.x},${q1.y} ${tip.x},${tip.y}`} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" />
                <polygon points={`0,0 ${-hs * 1.4},${-hs * 0.75} ${-hs * 1.4},${hs * 0.75}`} fill={col} transform={`translate(${tip.x},${tip.y}) rotate(${ang})`} />
              </g>
            );
          })}
        </svg>
        {points.map((d, i) => {
          const k = ramp(t, tp[i], tp[i] + 0.6, Easing.out(Easing.back(2.5)));
          if (k <= 0) return null;
          const ring = ((t - tp[i]) % 1.6) / 1.6;
          const p = px(d.x, d.y);
          return (
            <div key={i} style={{ position: "absolute", left: p.x, top: p.y, transform: `scale(${1 / s})`, transformOrigin: "0 0" }}>
              <div style={{ position: "absolute", left: -40, top: -40, width: 80, height: 80, borderRadius: 40, border: `3px solid ${K.red}`, opacity: 1 - ring, transform: `scale(${0.3 + ring})` }} />
              <div style={{ position: "absolute", left: -13, top: -13, width: 26, height: 26, borderRadius: 13, background: K.red, border: `4px solid ${K.paper}`, transform: `scale(${k})`, boxShadow: "0 2px 10px rgba(0,0,0,0.7)" }} />
              {d.ten ? (
                <div
                  style={{
                    position: "absolute",
                    ...BEN[d.ben],
                    whiteSpace: "nowrap",
                    padding: "6px 16px",
                    background: "rgba(11,9,7,0.82)",
                    borderLeft: `4px solid ${K.red}`,
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 32,
                    color: K.paper,
                    opacity: ramp(t, tp[i] + 0.2, tp[i] + 0.8),
                  }}
                >
                  {d.ten}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(20,12,4,0.65) 100%)" }} />
      {title ? <SceneTitle t={t} label="Bản đồ" title={title} /> : null}
      <svg width="120" height="120" viewBox="-60 -60 120 120" style={{ position: "absolute", right: 110, bottom: 150, opacity: 0.8 * ramp(t, 0.6, 1.6) }}>
        <circle r="44" fill="none" stroke={K.paper} strokeOpacity={0.6} strokeWidth="2" />
        <polygon points="0,-52 9,0 0,8 -9,0" fill={K.red} />
        <polygon points="0,52 9,0 0,-8 -9,0" fill={K.paper} fillOpacity={0.8} />
        <text y="-60" textAnchor="middle" fontFamily={COND} fontSize="20" fill={K.paper}>
          B
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Thẻ nhân vật                                                        */
/* ------------------------------------------------------------------ */
export const Profile: React.FC<SP & { src: string; name: string; years: string; role: string; facts: string[] }> = ({ t, dur, seed, src, name, years, role, facts }) => {
  const p = prog(t, dur);
  const enter = ramp(t, 0.1, 1.3);
  return (
    <AbsoluteFill style={{ opacity: fade(t, dur) }}>
      <Photo src={src} p={p} seed={seed} loc="cu" filter="blur(28px) brightness(0.28)" />
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 170,
          width: 560,
          height: 700,
          padding: 16,
          background: K.paper,
          boxShadow: "0 30px 80px rgba(0,0,0,0.75)",
          opacity: enter,
          transform: `translateX(${(1 - enter) * -60}px) rotate(${-1.2 + 0.6 * p}deg)`,
        }}
      >
        <div style={{ width: "100%", height: "100%", overflow: "hidden", outline: `2px solid ${K.gold}`, outlineOffset: -10 }}>
          <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%", filter: LOC.cu, transform: `scale(${1.04 + 0.08 * p})` }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 880, top: 0, bottom: 0, right: 160, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 60 }}>
        <Tag o={ramp(t, 0.6, 1.4)} size={28}>
          {role}
        </Tag>
        <div
          style={{
            marginTop: 14,
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: name.length > 18 ? 82 : 108,
            lineHeight: 1.05,
            color: K.paper,
            textShadow: shadow,
            opacity: ramp(t, 0.8, 1.8),
            transform: `translateY(${(1 - ramp(t, 0.8, 1.8)) * 24}px)`,
            filter: `blur(${(1 - ramp(t, 0.8, 1.8)) * 6}px)`,
          }}
        >
          {name}
        </div>
        {years ? <div style={{ marginTop: 10, fontFamily: COND, fontWeight: 400, fontSize: 46, letterSpacing: 4, color: K.gold, opacity: ramp(t, 1.4, 2.2) }}>{years}</div> : null}
        <div style={{ width: 420 * ramp(t, 1.6, 2.6), height: 2, margin: "28px 0 26px", background: `linear-gradient(90deg, ${K.gold}, transparent)` }} />
        {facts.map((f, i) => {
          const k = ramp(t, 2.4 + i * 0.6, 3.2 + i * 0.6);
          return (
            <div key={i} style={{ display: "flex", gap: 20, alignItems: "baseline", marginBottom: 18, opacity: k, transform: `translateX(${(1 - k) * 24}px)` }}>
              <div style={{ width: 12, height: 12, flex: "none", background: K.gold, transform: "rotate(45deg) translateY(-4px)" }} />
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, lineHeight: 1.35, color: K.paper, textShadow: shadow }}>{f}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
