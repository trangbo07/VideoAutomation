import { Redis } from "@upstash/redis";

// Upstash Redis. Tùy cách gắn trên Vercel, biến môi trường có thể là
// KV_REST_API_URL/KV_REST_API_TOKEN hoặc UPSTASH_REDIS_REST_URL/..._TOKEN.
// Nhận cả hai để tránh lỗi tên biến.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  throw new Error(
    "Chưa cấu hình Upstash Redis (thiếu KV_REST_API_URL/TOKEN). Gắn Upstash cho project trên Vercel."
  );
}
export const redis = new Redis({ url, token });

const KEY_PREFIX = "lic:";
const INDEX = "lics";

export function recKey(key) {
  return KEY_PREFIX + key;
}

/** Lấy một bản ghi license theo key. null nếu không có. */
export async function getLicense(key) {
  if (!key) return null;
  return await redis.get(recKey(key));
}

/** Ghi (tạo/ghi đè) một bản ghi license và thêm vào danh sách. */
export async function putLicense(rec) {
  await redis.set(recKey(rec.key), rec);
  await redis.sadd(INDEX, rec.key);
}

/** Danh sách toàn bộ license (cho trang quản trị). */
export async function listLicenses() {
  const keys = await redis.smembers(INDEX);
  if (!keys || keys.length === 0) return [];
  const recs = await Promise.all(keys.map((k) => redis.get(recKey(k))));
  return recs.filter(Boolean).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function deleteLicense(key) {
  await redis.del(recKey(key));
  await redis.srem(INDEX, key);
}
