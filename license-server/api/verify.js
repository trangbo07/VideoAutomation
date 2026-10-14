import { getLicense } from "../lib/store.js";
import { TICKET_TTL_SEC, licenseState, now, readJson, send, signTicket } from "../lib/common.js";

// POST /api/verify  { key, machineId }
// Mỗi lần render, máy khách xin một "vé" có chữ ký, sống TICKET_TTL_SEC.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  const { key, machineId } = await readJson(req);
  if (!key || !machineId) return send(res, 400, { error: "thiếu key hoặc machineId" });

  const rec = await getLicense(String(key).trim().toUpperCase());
  if (!rec) return send(res, 404, { error: "Key không tồn tại", reason: "not_found" });
  if (rec.revoked) return send(res, 403, { error: "Key đã bị khóa", reason: "revoked" });
  if (!rec.machineId)
    return send(res, 403, { error: "Key chưa kích hoạt", reason: "not_activated" });
  if (rec.machineId !== machineId)
    return send(res, 403, { error: "Sai máy", reason: "machine_mismatch" });

  const st = licenseState(rec);
  if (!st.ok)
    return send(res, 403, { error: "Key hết hiệu lực", reason: st.reason, expiresAt: st.expiresAt });

  const iat = now();
  const ticket = signTicket({
    key: rec.key,
    machineId,
    iat,
    exp: iat + TICKET_TTL_SEC,
    licenseExpiresAt: rec.expiresAt,
  });
  return send(res, 200, { ok: true, ticket, expiresAt: rec.expiresAt });
}
