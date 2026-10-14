import crypto from "node:crypto";

export const TICKET_TTL_SEC = 15 * 60; // vé render sống 15 phút
const KID = "k1";

function privateKey() {
  const b64 = process.env.LICENSE_PRIVATE_KEY;
  if (!b64) throw new Error("Thiếu biến môi trường LICENSE_PRIVATE_KEY");
  return crypto.createPrivateKey({
    key: Buffer.from(b64, "base64"),
    format: "der",
    type: "pkcs8",
  });
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

/** Ký một "vé" render: payload JSON -> "<payload_b64url>.<sig_b64url>" */
export function signTicket(payload) {
  const body = { ...payload, kid: KID };
  const data = Buffer.from(JSON.stringify(body), "utf8");
  const sig = crypto.sign(null, data, privateKey()); // Ed25519
  return b64url(data) + "." + b64url(sig);
}

/** Sinh key license dạng STLS-XXXX-XXXX-XXXX-XXXX (không gồm ký tự dễ nhầm). */
export function genKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(16);
  let out = "";
  for (let i = 0; i < 16; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i % 4 === 3 && i < 15) out += "-";
  }
  return "STLS-" + out;
}

export function now() {
  return Math.floor(Date.now() / 1000);
}

/** Đọc JSON body an toàn cho Vercel Node function. */
export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(obj));
}

/** Trạng thái hiệu lực của một license tại thời điểm hiện tại. */
export function licenseState(rec) {
  if (!rec) return { ok: false, reason: "not_found" };
  if (rec.revoked) return { ok: false, reason: "revoked" };
  if (rec.expiresAt && now() > rec.expiresAt)
    return { ok: false, reason: "expired", expiresAt: rec.expiresAt };
  return { ok: true, expiresAt: rec.expiresAt || null };
}
