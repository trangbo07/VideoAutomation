import { deleteLicense, getLicense, listLicenses, putLicense } from "../lib/store.js";
import { genKey, now, readJson, send } from "../lib/common.js";

function authed(req) {
  const want = process.env.ADMIN_TOKEN;
  if (!want) return false;
  const h = req.headers["authorization"] || "";
  const bearer = h.startsWith("Bearer ") ? h.slice(7) : "";
  const token = req.headers["x-admin-token"] || bearer;
  return token === want;
}

// GET  /api/admin           -> danh sách license
// POST /api/admin           -> { action: "create"|"revoke"|"unrevoke"|"extend"|"delete", ... }
export default async function handler(req, res) {
  if (!authed(req)) return send(res, 401, { error: "Sai mật khẩu quản trị" });

  if (req.method === "GET") {
    return send(res, 200, { ok: true, licenses: await listLicenses() });
  }

  if (req.method === "POST") {
    const body = await readJson(req);
    const action = body.action;

    if (action === "create") {
      const days = Number(body.days) || 7;
      const rec = {
        key: genKey(),
        label: body.label || "",
        days,
        createdAt: now(),
        activatedAt: null,
        expiresAt: null, // tính khi kích hoạt lần đầu
        machineId: null,
        machineName: null,
        revoked: false,
      };
      await putLicense(rec);
      return send(res, 200, { ok: true, license: rec });
    }

    const key = String(body.key || "").trim().toUpperCase();
    const rec = await getLicense(key);
    if (!rec) return send(res, 404, { error: "Key không tồn tại" });

    if (action === "revoke") rec.revoked = true;
    else if (action === "unrevoke") rec.revoked = false;
    else if (action === "extend") {
      const add = Number(body.days) || 0;
      const base = rec.expiresAt && rec.expiresAt > now() ? rec.expiresAt : now();
      rec.expiresAt = base + add * 86400;
      rec.revoked = false;
    } else if (action === "resetMachine") {
      rec.machineId = null;
      rec.machineName = null;
    } else if (action === "delete") {
      await deleteLicense(key);
      return send(res, 200, { ok: true, deleted: key });
    } else {
      return send(res, 400, { error: "action không hợp lệ" });
    }

    await putLicense(rec);
    return send(res, 200, { ok: true, license: rec });
  }

  return send(res, 405, { error: "method" });
}
