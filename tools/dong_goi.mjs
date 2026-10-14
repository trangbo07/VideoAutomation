#!/usr/bin/env node
// Đóng gói bản phát hành cho khách: build bundle (JS đã nén, KHÔNG kèm mã nguồn .tsx)
// rồi đặt vào client/bundle. Chạy trên MÁY BẠN:  node tools/dong_goi.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "client", "bundle");

async function main() {
  let bundle;
  try {
    ({ bundle } = await import("@remotion/bundler"));
  } catch {
    console.error("Cần cài @remotion/bundler: npm i -D @remotion/bundler");
    process.exit(1);
  }

  console.log("• Đang build bundle…");
  const dir = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
    // publicDir rỗng: không nhúng ảnh/âm thanh của bạn vào bản giao cho khách.
    publicDir: path.join(ROOT, "tools", "public_rong"),
    onProgress: (p) => process.stdout.write("\r  " + p + "%   "),
  });
  process.stdout.write("\n");

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(dir, OUT, { recursive: true });
  console.log("✓ Bundle đã đặt tại: " + OUT);
  console.log("  Giao cho khách thư mục client/ (đã có bundle). KHÔNG giao thư mục src/.");
}
main();
