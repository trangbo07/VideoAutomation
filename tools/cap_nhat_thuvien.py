"""Quét public/thuvien/ và ghi danh sách ảnh vào src/thuvien.ts (chạy lại mỗi khi thêm/xoá ảnh).

Ảnh tự thêm (ảnh trên mạng, ảnh AI, ảnh tự chụp) chưa có nguồn sẽ được ghi vào nguon.json
với nguồn "chưa ghi" — mở file đó điền tác giả/đường dẫn để tiện ghi nguồn khi đăng video.
"""
import sys; sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "public", "thuvien")
fs = sorted(f for f in os.listdir(LIB) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))
body = ",\n".join(f'  "thuvien/{f}"' for f in fs)
open(os.path.join(ROOT, "src", "thuvien.ts"), "w", encoding="utf-8").write(
    "// Tự động sinh bởi tools/cap_nhat_thuvien.py — danh sách ảnh trong public/thuvien\n"
    f"export const THU_VIEN: string[] = [\n{body}{',' if fs else ''}\n];\n")

path = os.path.join(LIB, "nguon.json")
nguon = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else []
have = {m["file"] for m in nguon}
moi = [f for f in fs if f not in have]
nguon += [dict(file=f, title="", author="", license="", source="chưa ghi") for f in moi]
nguon = [m for m in nguon if m["file"] in fs]
json.dump(nguon, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(fs), "ảnh" + (f" ({len(moi)} ảnh mới chưa ghi nguồn, xem nguon.json)" if moi else ""))
