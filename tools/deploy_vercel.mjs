#!/usr/bin/env node
// Deploy license-server lên Vercel qua REST API — chỉ dùng Node built-in (không cần npm).
// Đọc token từ .vercel_token (hoặc env VERCEL_TOKEN), bí mật từ .deploy.env.
// Dùng: node tools/deploy_vercel.mjs
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRV = path.join(ROOT, "license-server");
const PROJECT = "stls-license-server";
const API = "https://api.vercel.com";

function readFileSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return ""; }
}
function loadEnvFile(p) {
  const out = {};
  for (const line of readFileSafe(p).split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const TOKEN = (process.env.VERCEL_TOKEN || readFileSafe(path.join(ROOT, ".vercel_token"))).trim();
if (!TOKEN) {
  console.error("✖ Thiếu token. Tạo file .vercel_token chứa token Vercel (vercel.com/account/tokens).");
  process.exit(1);
}
const TEAM = (process.env.VERCEL_TEAM_ID || "").trim();
const secrets = loadEnvFile(path.join(ROOT, ".deploy.env"));

function q(extra = "") {
  const parts = [];
  if (TEAM) parts.push("teamId=" + encodeURIComponent(TEAM));
  if (extra) parts.push(extra);
  return parts.length ? "?" + parts.join("&") : "";
}
async function api(method, endpoint, body, raw) {
  const headers = { Authorization: "Bearer " + TOKEN };
  let payload;
  if (raw) { headers["Content-Type"] = "application/octet-stream"; payload = raw.body; if (raw.digest) headers["x-vercel-digest"] = raw.digest; }
  else if (body !== undefined) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const r = await fetch(API + endpoint, { method, headers, body: payload });
  const txt = await r.text();
  let json; try { json = txt ? JSON.parse(txt) : {}; } catch { json = { raw: txt }; }
  return { status: r.status, json };
}

function collect(dir, base = "") {
  const files = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".vercel", ".git"].includes(e.name) || e.name.startsWith(".env")) continue;
    const abs = path.join(dir, e.name);
    const rel = base ? base + "/" + e.name : e.name;
    if (e.isDirectory()) files.push(...collect(abs, rel));
    else files.push({ rel, abs });
  }
  return files;
}

async function main() {
  // 1) Tạo project (bỏ qua nếu đã có).
  let p = await api("POST", "/v10/projects" + q(), { name: PROJECT, framework: null });
  if (p.status === 409) console.log("• Project đã tồn tại, dùng lại.");
  else if (p.status >= 300) throw new Error("Tạo project lỗi: " + JSON.stringify(p.json));
  else console.log("• Đã tạo project " + PROJECT);

  // 2) Đặt biến môi trường (upsert).
  for (const key of ["LICENSE_PRIVATE_KEY", "ADMIN_TOKEN"]) {
    const value = secrets[key];
    if (!value) { console.warn("  ! bỏ qua " + key + " (thiếu trong .deploy.env)"); continue; }
    const e = await api("POST", `/v10/projects/${PROJECT}/env` + q("upsert=true"), {
      key, value, type: "encrypted", target: ["production", "preview", "development"],
    });
    if (e.status >= 300) throw new Error("Đặt env " + key + " lỗi: " + JSON.stringify(e.json));
    console.log("  ✓ env " + key);
  }

  // 3) Tải từng file lên kho tạm.
  const files = collect(SRV);
  const manifest = [];
  for (const f of files) {
    const buf = fs.readFileSync(f.abs);
    const sha = crypto.createHash("sha1").update(buf).digest("hex");
    const up = await api("POST", "/v2/files" + q(), undefined, { body: buf, digest: sha });
    if (up.status >= 300) throw new Error("Upload " + f.rel + " lỗi: " + JSON.stringify(up.json));
    manifest.push({ file: f.rel, sha, size: buf.length });
    console.log("  ↑ " + f.rel);
  }

  // 4) Tạo deployment production.
  const d = await api("POST", "/v13/deployments" + q("skipAutoDetectionConfirmation=1"), {
    name: PROJECT,
    project: PROJECT,
    target: "production",
    files: manifest,
    projectSettings: { framework: null },
  });
  if (d.status >= 300) throw new Error("Tạo deployment lỗi: " + JSON.stringify(d.json));
  const id = d.json.id;
  let url = d.json.url;
  console.log("• Deployment: https://" + url + " (đang build…)");

  // 5) Chờ build xong.
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const s = await api("GET", `/v13/deployments/${id}` + q());
    const st = s.json.readyState || s.json.status;
    process.stdout.write("\r  trạng thái: " + st + "        ");
    if (st === "READY") {
      process.stdout.write("\n");
      const alias = (s.json.alias && s.json.alias[0]) || url;
      console.log("✓ XONG. Địa chỉ server:");
      console.log("   https://" + alias);
      console.log("   Trang quản trị: https://" + alias + "/admin.html");
      return;
    }
    if (st === "ERROR" || st === "CANCELED") {
      process.stdout.write("\n");
      throw new Error("Build thất bại (" + st + "). Xem log trên vercel.com.");
    }
  }
  console.log("\n! Build lâu hơn dự kiến, kiểm tra trên vercel.com.");
}
main().catch((e) => { console.error("\n✖ " + (e.message || e)); process.exit(1); });
