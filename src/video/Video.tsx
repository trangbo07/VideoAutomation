import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { THU_VIEN } from "../thuvien";
import { Archive, MapScene, Opening, Part, Profile, Quote, Stat, Still, Timeline, Year } from "./Canh";
import { clamp, COND, drift, img, K, LOC, Loc, ramp, SANS, SERIF } from "./look";
import { FilmLook } from "./Phim";
import type { CanhDau, VideoProps } from "./schema";
import { Cue, useSrt } from "./srt";

const OVERLAP = 1.0; // chồng mờ giữa hai cảnh (giây)
const XFADE = 1.8; // chồng mờ giữa hai ảnh lặp (giây)

/* ------------------------------------------------------------------ */
/* Ảnh lặp: mỗi vòng xáo trộn thứ tự khác nhau để đỡ nhàm              */
/* ------------------------------------------------------------------ */
const slotImage = (list: string[], k: number): string => {
  const n = list.length;
  const cycle = Math.floor(k / n);
  const order = list
    .map((f, i) => ({ f, r: random(`vong-${cycle}-${i}`) }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.f);
  // tránh lặp đúng ảnh ở chỗ nối hai vòng
  if (k % n === 0 && cycle > 0 && n > 1) {
    const prev = slotImage(list, k - 1);
    if (order[0] === prev) [order[0], order[1]] = [order[1], order[0]];
  }
  return order[k % n];
};

const Slideshow: React.FC<{ t: number; from: number; list: string[]; per: number; loc: Loc }> = ({ t, from, list, per, loc }) => {
  if (!list.length) return null;
  const local = Math.max(0, t - from);
  const k = Math.floor(local / per);
  const slots = [k - 1, k].filter((s) => s >= 0);
  return (
    <AbsoluteFill style={{ opacity: ramp(t, from - 1.2, from + 0.3) }}>
      {slots.map((s) => {
        const s0 = s * per;
        const p = interpolate(local, [s0, s0 + per + XFADE], [0, 1], clamp);
        const o = s === k ? ramp(local, s0, s0 + XFADE, Easing.inOut(Easing.quad)) : 1;
        return (
          <AbsoluteFill key={s} style={{ opacity: s === 0 && k === 0 ? 1 : o, overflow: "hidden" }}>
            <Img src={img(slotImage(list, s))} style={{ width: "100%", height: "100%", objectFit: "cover", transform: drift(p, s), filter: LOC[loc] }} />
            <AbsoluteFill style={{ background: "rgba(12,9,6,0.2)" }} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Phụ đề                                                              */
/* ------------------------------------------------------------------ */
const findCue = (cues: Cue[], t: number) => {
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    const next = cues[i + 1];
    // giữ câu trên màn thêm chút nếu khoảng nghỉ ngắn
    const until = next ? Math.max(c.end, Math.min(c.end + 0.6, next.start - 0.05)) : c.end + 1;
    if (t >= c.start - 0.1 && t < until) return { c, until };
    if (c.start > t) break;
  }
  return null;
};

const Subtitle: React.FC<{ cues: Cue[]; t: number; size: number; bottom: number; byWord: boolean }> = ({ cues, t, size, bottom, byWord }) => {
  const hit = findCue(cues, t);
  if (!hit) return null;
  const { c, until } = hit;
  const o = Math.min(ramp(t, c.start - 0.1, c.start + 0.15), 1 - ramp(t, until - 0.15, until));
  const words = c.text.split(" ");
  // ước lượng thời điểm từng chữ theo độ dài ký tự
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  let acc = 0;
  const at = words.map((w) => {
    const s = c.start + ((c.end - c.start) * acc) / total;
    acc += w.length + 1;
    return s;
  });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 280, background: "linear-gradient(0deg, rgba(8,6,4,0.8), transparent)", opacity: o }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center", opacity: o }}>
        <div
          style={{
            maxWidth: 1480,
            padding: "12px 34px 14px",
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: size,
            lineHeight: 1.38,
            color: K.white,
            textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)",
          }}
        >
          {byWord
            ? words.map((w, i) => {
                const active = t >= at[i] && (i + 1 >= words.length || t < at[i + 1]);
                return (
                  <span key={i} style={{ color: active ? K.gold : K.white, opacity: t >= at[i] ? 1 : 0.55 }}>
                    {w}{" "}
                  </span>
                );
              })
            : c.text}
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Logo kênh góc trái trên + thanh tiến trình                          */
/* ------------------------------------------------------------------ */
const Brand: React.FC<{ t: number; total: number; name: string; ep: string }> = ({ t, total, name, ep }) => {
  const o = Math.min(ramp(t, 6, 8), 1 - ramp(t, total - 3, total - 1));
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <div style={{ position: "absolute", top: 46, left: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={K.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2.5h12M6 21.5h12" />
          <path d="M7.5 2.5c0 4.5 4.5 6 4.5 9.5s-4.5 5-4.5 9.5M16.5 2.5c0 4.5-4.5 6-4.5 9.5s4.5 5 4.5 9.5" />
          <path d="M9.5 19.5c1-1.2 4-1.2 5 0" fill={K.gold} />
        </svg>
        <div>
          <div style={{ fontFamily: COND, fontWeight: 600, fontSize: 30, letterSpacing: 5, color: K.paper, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>{name}</div>
          {ep ? <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: K.mute, textShadow: "0 2px 8px rgba(0,0,0,0.7)", marginTop: 0 }}>{ep}</div> : null}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 4, width: `${(t / total) * 100}%`, background: K.gold, opacity: 0.6 }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Phần dựng cảnh                                                      */
/* ------------------------------------------------------------------ */
const renderCanh = (c: CanhDau, t: number, dur: number, seed: number) => {
  const sp = { t, dur, seed };
  switch (c.loai) {
    case "mo":
      return <Opening {...sp} bg={c.anhNen} tag={c.nhan} lines={c.tieuDe} sub={c.phu} />;
    case "anh":
      return <Still {...sp} src={c.anh} text={c.chu} loc={c.loc} />;
    case "tuLieu":
      return <Archive {...sp} src={c.anh} caption={c.chuThich} source={c.nguon} year={c.nam} colorize={c.hienMau} />;
    case "trich":
      return <Quote {...sp} bg={c.anhNen} text={c.loi} author={c.tacGia} />;
    case "chuong":
      return <Part {...sp} bg={c.anhNen} num={c.so} title={c.tieuDe} era={c.thoiKy} />;
    case "moc":
      return <Year {...sp} bg={c.anhNen} from={c.demTu} year={c.nam} title={c.tieuDe} place={c.diaDiem} />;
    case "soLieu":
      return <Stat {...sp} bg={c.anhNen} value={c.so} before={c.truocSo} unit={c.donVi} label={c.nhan} />;
    case "dongThoiGian":
      return <Timeline {...sp} bg={c.anhNen} title={c.tieuDe} events={c.suKien} />;
    case "banDo":
      return <MapScene {...sp} src={c.anh} title={c.tieuDe} antique={c.locCu} zoom={c.zoom} points={c.diem} arrows={c.muiTen} />;
    case "nhanVat":
      return <Profile {...sp} src={c.anh} name={c.ten} years={c.namSinhMat} role={c.chucDanh} facts={c.thongTin} />;
    default:
      return null;
  }
};

const SceneAt: React.FC<{ canh: CanhDau; dur: number; seed: number }> = ({ canh, dur, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <AbsoluteFill>{renderCanh(canh, frame / fps, dur, seed)}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ */
export const LichSuVideo: React.FC<VideoProps> = ({ tenKenh, tenTap, giongDoc, amLuongGiong, nhacNen, amLuongNhac, phuDe, phimCu, canh, anhLap }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;
  const cues = useSrt(phuDe.hien ? phuDe.file : "");

  const ds = [...canh.ds].sort((a, b) => a.batDau - b.batDau);
  const loopFrom = ds.length ? canh.ketThuc : 0;
  const list = anhLap.danhSach.length ? anhLap.danhSach : THU_VIEN;

  return (
    <AbsoluteFill style={{ background: K.ink }}>
      {giongDoc ? <Audio src={staticFile(giongDoc)} volume={amLuongGiong} /> : null}
      {nhacNen ? (
        <Audio src={staticFile(nhacNen)} loop volume={(f) => amLuongNhac * Math.min(ramp(f / fps, 0, 3), 1 - ramp(f / fps, total - 5, total - 0.5))} />
      ) : null}

      {loopFrom < total ? <Slideshow t={t} from={loopFrom} list={list} per={anhLap.giayMoiAnh} loc={anhLap.loc} /> : null}

      {ds.map((c, i) => {
        const start = c.batDau;
        const end = i + 1 < ds.length ? ds[i + 1].batDau + OVERLAP : Math.max(start + 2, canh.ketThuc + OVERLAP);
        const from = Math.round(start * fps);
        const dur = Math.max(1, Math.round((end - start) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none" name={`${c.loai} · ${start.toFixed(1)}s`}>
            <SceneAt canh={c} dur={dur / fps} seed={i + 7} />
          </Sequence>
        );
      })}

      <FilmLook frame={frame} d={phimCu} />
      <Brand t={t} total={total} name={tenKenh} ep={tenTap} />
      {phuDe.hien ? <Subtitle cues={cues} t={t} size={phuDe.coChu} bottom={phuDe.cachDay} byWord={canh.chayTungChu && t < loopFrom} /> : null}
    </AbsoluteFill>
  );
};
