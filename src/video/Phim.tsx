import React from "react";
import { AbsoluteFill, Img, random } from "remotion";
import { drift, img, LOC, Loc } from "./look";

/** Ảnh phủ kín khung, trôi chậm */
export const Photo: React.FC<{ src: string; p: number; seed: number; filter?: string; loc?: Loc }> = ({ src, p, seed, filter, loc = "goc" }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: drift(p, seed), filter: `${LOC[loc]} ${filter ?? ""}` }} />
  </AbsoluteFill>
);

/**
 * Lớp phim cũ phủ toàn video: tông giấy cũ, viền tối, hạt phim, vết xước dọc,
 * đốm bụi và nhấp nháy sáng tối. `d` = độ đậm (0 tắt hiệu ứng phim, vẫn giữ tông và viền).
 */
export const FilmLook: React.FC<{ frame: number; d: number }> = ({ frame, d }) => {
  const flick = d * 0.07 * random(`fl${frame}`);
  // vết xước đổi chỗ mỗi 3 khung để trông như phim chạy
  const blk = Math.floor(frame / 3);
  const scratches = [0, 1, 2].filter((i) => random(`sc${i}-${blk}`) < 0.3 * d);
  const specks = new Array(6).fill(0).map((_, i) => i).filter((i) => random(`sp${i}-${frame}`) < 0.18 * d);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(200,150,80,0.10), rgba(60,30,10,0.22))", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 48%, rgba(0,0,0,0.72) 100%)" }} />
      {d > 0 ? (
        <>
          <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.22 * d, mixBlendMode: "overlay" }}>
            <filter id={`hat-${frame}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 24} stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="960" height="540" filter={`url(#hat-${frame})`} />
          </svg>
          <AbsoluteFill style={{ background: "#000", opacity: flick }} />
          {scratches.map((i) => {
            const x = random(`sx${i}-${blk}`) * 1920;
            const w = 1 + random(`sw${i}-${blk}`) * 2;
            return (
              <div
                key={`s${i}`}
                style={{
                  position: "absolute",
                  left: x,
                  top: 0,
                  bottom: 0,
                  width: w,
                  background: "linear-gradient(180deg, transparent, rgba(255,245,220,0.5) 30%, rgba(255,245,220,0.35) 70%, transparent)",
                  opacity: 0.6,
                }}
              />
            );
          })}
          {specks.map((i) => {
            const r = 2 + random(`sr${i}-${frame}`) * 5;
            return (
              <div
                key={`d${i}`}
                style={{
                  position: "absolute",
                  left: random(`spx${i}-${frame}`) * 1920,
                  top: random(`spy${i}-${frame}`) * 1080,
                  width: r * 2,
                  height: r * (1 + random(`sh${i}`)),
                  borderRadius: r,
                  background: random(`sc${i}-${frame}`) < 0.5 ? "rgba(0,0,0,0.7)" : "rgba(255,240,210,0.6)",
                }}
              />
            );
          })}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
