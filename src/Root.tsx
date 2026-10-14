import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { parseMedia } from "@remotion/media-parser";
import { LichSuVideo } from "./video/Video";
import { videoSchema, VideoProps } from "./video/schema";
import { tapMau } from "./tap/mau";
import { tap01 } from "./tap/tap01";

const FPS = 30;

/** Độ dài video = thoiLuong (nếu > 0), nếu không thì lấy theo file giọng đọc */
const theoGiongDoc: CalculateMetadataFunction<VideoProps> = async ({ props }) => {
  let sec = props.thoiLuong;
  if (!sec && props.giongDoc) {
    const { durationInSeconds } = await parseMedia({ src: staticFile(props.giongDoc), fields: { durationInSeconds: true } });
    sec = (durationInSeconds ?? 60) + 1.5;
  }
  return { durationInFrames: Math.max(1, Math.round((sec || 60) * FPS)) };
};

/** Mỗi tập là một Composition; thêm tập mới bằng cách thêm một dòng vào đây */
const TAP: { id: string; props: VideoProps }[] = [
  { id: "TapMau", props: tapMau },
  { id: "Tap01", props: tap01 },
  // Composition động: công cụ `stls` render tập bất kỳ bằng cách nạp tap.json vào đây
  { id: "Tap", props: tapMau },
];

export const RemotionRoot: React.FC = () => (
  <>
    {TAP.map((x) => (
      <Composition
        key={x.id}
        id={x.id}
        component={LichSuVideo}
        schema={videoSchema}
        defaultProps={x.props}
        calculateMetadata={theoGiongDoc}
        durationInFrames={60 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    ))}
  </>
);
