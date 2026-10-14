import { getLicense, putLicense } from "../lib/store.js";
import { licenseState, now, readJson, send } from "../lib/common.js";

// POST /api/activate  { key, machineId, machineName? }
// Lần đầu kích hoạt: gắn key với máy và bắt đầu đếm thời hạn.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  const { key, machineId, machineName } = await readJson(req);
  if (!key || !machineId) return send(res, 400, { error: "thiếu key hoặc machineId" });

  const rec = await getLicense(String(key).trim().toUpperCase());
  if (!rec) return send(res, 404, { error: "Key không tồn tại", reason: "not_found" });
  if (rec.revoked) return send(res, 403, { error: "Key đã bị khóa", reason: "revoked" });

  // Gắn máy: nếu chưa gắn thì gắn máy hiện tại; nếu đã gắn máy khác thì từ chối.
  if (!rec.machineId) {
    rec.machineId = machineId;
    rec.machineName = machineName || null;
    rec.activatedAt = now();
    rec.expiresAt = now() + rec.days * 86400;
  } else if (rec.machineId !== machineId) {
    return send(res, 403, {
      error: "Key đã được kích hoạt trên một máy khác",
      reason: "machine_mismatch",
    });
  }

  const st = licenseState(rec);
  if (!st.ok) return send(res, 403, { error: "Key hết hiệu lực", reason: st.reason });

  await putLicense(rec);
  return send(res, 200, {
    ok: true,
    expiresAt: rec.expiresAt,
    days: rec.days,
    label: rec.label || null,
  });
}
