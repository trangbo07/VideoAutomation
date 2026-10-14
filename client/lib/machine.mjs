import crypto from "node:crypto";
import os from "node:os";

/** Mã máy ổn định: băm từ các địa chỉ MAC thật + hostname + nền tảng. */
export function machineId() {
  const macs = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces).sort()) {
    for (const ni of ifaces[name] || []) {
      if (!ni.internal && ni.mac && ni.mac !== "00:00:00:00:00:00") macs.push(ni.mac);
    }
  }
  const raw = [...new Set(macs)].sort().join(",") + "|" + os.hostname() + "|" + os.platform() + "|" + os.arch();
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

export function machineName() {
  return `${os.hostname()} (${os.platform()}/${os.arch()})`;
}
