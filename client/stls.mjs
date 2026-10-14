#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { activate, requireTicket, resolveKey, statusText } from "./lib/license.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = path.join(HERE, "bundle");

function die(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}
function log(msg) {
  console.log(msg);
}

function help() {
  log(`stls — công cụ render video Sự Thật Lịch Sử

  stls activate <KEY>          Kích hoạt key trên máy này (một lần)
  stls status                  Xem tình trạng key
  stls xem <tap.json>          Dựng bản XEM TRƯỚC nhanh (nét thấp) rồi tự mở để xem
  stls render <tap.json> [ra.mp4]
                               Render bản chính (nét đầy đủ). Ảnh/âm thanh lấy từ
                               thư mục public/ cạnh file tap.json (hoặc ./public).

Biến môi trường:
  STLS_KEY       key (thay cho 'stls activate')
  STLS_SERVER    địa chỉ server cấp phép (mặc định đã cấu hình sẵn)
`);
}

/** Sao chép đệ quy (dùng cho gộp public của khách vào thư mục phục vụ). */
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

async function cmdRender(args, opts = {}) {
  const draft = !!opts.draft;
  const input = args[0];
  if (!input) die("Thiếu đường dẫn tap.json. Ví dụ: stls render du_an/tap01/tap.json");
  const tapPath = path.resolve(input);
  if (!fs.existsSync(tapPath)) die("Không thấy file: " + tapPath);

  let tap;
  try {
    tap = JSON.parse(fs.readFileSync(tapPath, "utf8"));
  } catch (e) {
    die("tap.json không phải JSON hợp lệ: " + e.message);
  }

  // Thư mục public của khách: ./public cạnh tap.json, lùi dần lên trên.
  let publicDir = null;
  for (const base of [path.dirname(tapPath), path.dirname(path.dirname(tapPath)), process.cwd()]) {
    const p = path.join(base, "public");
    if (fs.existsSync(p)) { publicDir = p; break; }
  }
  if (!publicDir) die("Không tìm thấy thư mục public/ chứa ảnh và âm thanh.");

  // Kiểm tra tư liệu: giọng đọc bắt buộc; phụ đề/nhạc thiếu thì tự bỏ qua.
  const has = (rel) => rel && fs.existsSync(path.join(publicDir, rel));
  if (!has(tap.giongDoc)) {
    die(
      "Thiếu file giọng đọc: public/" + (tap.giongDoc || "(chưa khai báo)") +
        "\n  Hãy bỏ file .mp3 giọng đọc vào đúng chỗ đó (video dài theo file này)."
    );
  }
  if (tap.phuDe && tap.phuDe.hien && !has(tap.phuDe.file)) {
    console.warn("  ! Không thấy phụ đề public/" + tap.phuDe.file + " → render KHÔNG kèm phụ đề.");
    tap.phuDe = { ...tap.phuDe, hien: false };
  }
  if (tap.nhacNen && !has(tap.nhacNen)) {
    console.warn("  ! Không thấy nhạc nền public/" + tap.nhacNen + " → render KHÔNG nhạc nền.");
    tap.nhacNen = "";
  }

  if (!fs.existsSync(path.join(BUNDLE, "index.html")))
    die("Thiếu bản bundle. Liên hệ nhà cung cấp để nhận bản cài đặt đầy đủ.");

  // ⟶ Kiểm tra giấy phép TRƯỚC khi render.
  log("• Đang kiểm tra giấy phép…");
  let ticket;
  try {
    ticket = await requireTicket();
  } catch (e) {
    die("Giấy phép không hợp lệ: " + e.message);
  }
  const left = Math.max(0, Math.round((ticket.licenseExpiresAt - Date.now() / 1000) / 86400));
  log(`  ✓ Hợp lệ (còn khoảng ${left} ngày).`);

  // Tạo thư mục phục vụ = bundle + public của khách phủ lên.
  const serveDir = path.join(os.tmpdir(), "stls-serve-" + process.pid);
  fs.rmSync(serveDir, { recursive: true, force: true });
  copyDir(BUNDLE, serveDir);
  copyDir(publicDir, serveDir);

  const out = path.resolve(args[1] || (draft ? "out/xem-truoc.mp4" : "out.mp4"));
  fs.mkdirSync(path.dirname(out), { recursive: true });

  // Nạp @remotion/renderer (chỉ khi cần, báo lỗi rõ nếu chưa cài).
  let selectComposition, renderMedia;
  try {
    ({ selectComposition, renderMedia } = await import("@remotion/renderer"));
  } catch {
    die("Chưa cài đặt đầy đủ. Chạy: npm install  (trong thư mục stls).");
  }

  log(draft ? "• Đang dựng bản XEM TRƯỚC (nhanh, nét thấp)…" : "• Đang dựng video (có thể mất vài phút)…");
  try {
    const composition = await selectComposition({
      serveUrl: serveDir,
      id: "Tap",
      inputProps: tap,
    });
    await renderMedia({
      serveUrl: serveDir,
      composition,
      codec: "h264",
      // Bản xem trước: thu nhỏ 1/2, dựng cực nhanh, nén mạnh cho nhẹ.
      crf: draft ? 30 : 20,
      scale: draft ? 0.5 : 1,
      x264Preset: draft ? "ultrafast" : "medium",
      outputLocation: out,
      inputProps: tap,
      concurrency: null,
      chromiumOptions: { gl: "angle" },
      onProgress: ({ progress }) => {
        process.stdout.write("\r  " + Math.round(progress * 100) + "%   ");
      },
    });
    process.stdout.write("\n");
  } catch (e) {
    fs.rmSync(serveDir, { recursive: true, force: true });
    die("Lỗi khi render: " + (e.message || e));
  }
  fs.rmSync(serveDir, { recursive: true, force: true });
  log("✓ Xong: " + out);

  if (draft) {
    log("  (Đây là bản xem trước. Ưng rồi thì xuất bản chính bằng '3-TaoVideo.bat'.)");
    // Mở file bằng trình xem mặc định của Windows.
    try {
      const { spawn } = await import("node:child_process");
      spawn("cmd", ["/c", "start", "", out], { detached: true, stdio: "ignore" }).unref();
    } catch { /* bỏ qua nếu không mở được */ }
  }
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  try {
    if (cmd === "activate") {
      const j = await activate(args[0]);
      const exp = new Date(j.expiresAt * 1000).toLocaleString("vi-VN");
      log(`✓ Đã kích hoạt. Hết hạn: ${exp} (${j.days} ngày).`);
    } else if (cmd === "status") {
      log(statusText());
    } else if (cmd === "render") {
      await cmdRender(args);
    } else if (cmd === "xem") {
      await cmdRender(args, { draft: true });
    } else {
      help();
    }
  } catch (e) {
    die(e.message || String(e));
  }
}
main();
