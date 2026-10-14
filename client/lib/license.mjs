import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { machineId, machineName } from "./machine.mjs";

// Khóa công khai để kiểm tra chữ ký vé (khớp với LICENSE_PRIVATE_KEY trên server).
const PUBLIC_KEY_B64 = "MCowBQYDK2VwAyEAhn5BIblXB38hxomaAKGD4TF98R6DJclS1DCFAB1fHh4=";

// Địa chỉ server cấp phép. Có thể ghi đè bằng biến môi trường STLS_SERVER.
const DEFAULT_SERVER = "https://stls-license-server.vercel.app";

const STATE_DIR = path.join(os.homedir(), ".stls");
const STATE_FILE = path.join(STATE_DIR, "state.json");

function server() {
  return (process.env.STLS_SERVER || DEFAULT_SERVER).replace(/\/+$/, "");
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}
function writeState(s) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

/** Key lấy từ: tham số > env STLS_KEY > đã lưu trước đó. */
export function resolveKey(explicit) {
  const k = (explicit || process.env.STLS_KEY || readState().key || "").trim().toUpperCase();
  return k || null;
}

async function post(endpoint, body) {
  let r;
  try {
    r = await fetch(server() + endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error("Không kết nối được server cấp phép (" + server() + "). Kiểm tra mạng. " + e.message);
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Server từ chối (HTTP " + r.status + ")");
  return j;
}

/** Kích hoạt key trên máy hiện tại (lần đầu). */
export async function activate(explicitKey) {
  const key = resolveKey(explicitKey);
  if (!key) throw new Error("Chưa có key. Dùng: stls activate <KEY>");
  const j = await post("/api/activate", { key, machineId: machineId(), machineName: machineName() });
  writeState({ key, activatedAt: Date.now(), expiresAt: j.expiresAt });
  return j;
}

/** Kiểm tra chữ ký vé bằng khóa công khai. */
function verifyTicket(ticket) {
  const [bodyB64, sigB64] = String(ticket).split(".");
  if (!bodyB64 || !sigB64) throw new Error("Vé không hợp lệ");
  const data = Buffer.from(bodyB64, "base64url");
  const sig = Buffer.from(sigB64, "base64url");
  const pub = crypto.createPublicKey({
    key: Buffer.from(PUBLIC_KEY_B64, "base64"),
    format: "der",
    type: "spki",
  });
  if (!crypto.verify(null, data, pub, sig)) throw new Error("Chữ ký vé sai");
  return JSON.parse(data.toString("utf8"));
}

/**
 * Lấy một vé render hợp lệ. Xin server nếu chưa có vé còn hạn trong bộ nhớ tạm.
 * Trả về payload vé đã xác thực. Ném lỗi nếu không được phép.
 */
export async function requireTicket(explicitKey) {
  const key = resolveKey(explicitKey);
  if (!key) throw new Error("Chưa có key. Chạy: stls activate <KEY>");
  const mid = machineId();
  const nowSec = Math.floor(Date.now() / 1000);

  const st = readState();
  // Dùng lại vé đã lưu nếu còn hạn (>60s) và đúng máy/key.
  if (st.ticket) {
    try {
      const p = verifyTicket(st.ticket);
      if (p.key === key && p.machineId === mid && p.exp - nowSec > 60) return p;
    } catch {
      /* xin vé mới */
    }
  }

  const j = await post("/api/verify", { key, machineId: mid });
  const payload = verifyTicket(j.ticket);
  if (payload.machineId !== mid) throw new Error("Vé không khớp máy này");
  if (payload.exp <= nowSec) throw new Error("Vé đã hết hạn");
  writeState({ ...st, key, ticket: j.ticket, expiresAt: j.expiresAt });
  return payload;
}

export function statusText() {
  const st = readState();
  if (!st.key) return "Chưa kích hoạt.";
  const exp = st.expiresAt ? new Date(st.expiresAt * 1000).toLocaleString("vi-VN") : "—";
  return `Key: ${st.key}\nHết hạn: ${exp}\nServer: ${server()}`;
}
