"""Tìm và tải ảnh tư liệu lịch sử từ Wikimedia Commons (phần lớn là public domain hoặc CC).

Cách dùng:
    python tools/lay_anh_wiki.py tim "Ngô Quyền" 30        # tải tối đa 30 ảnh ứng viên vào _ungvien/
    python tools/lay_anh_wiki.py tim "Dien Bien Phu 1954"   # tìm bằng tiếng Anh thường ra nhiều ảnh hơn
    python tools/lay_anh_wiki.py chon 3 7 12 --ten dien_bien_phu   # chuyển ảnh đã chọn vào thư viện
    python tools/lay_anh_wiki.py nguon                      # in danh sách ghi nguồn để dán vào mô tả YouTube

Sau mỗi lần "tim", mở _ungvien/xem.html bằng trình duyệt để xem ảnh kèm số thứ tự.
Ảnh CC BY / CC BY-SA bắt buộc ghi tên tác giả: lệnh "nguon" in sẵn phần ghi nguồn đó.
"""
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import html, json, os, re, shutil, subprocess, time, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "public", "thuvien")
CAND = os.path.join(ROOT, "_ungvien")  # ngoài public/ để không bị đóng gói khi render
META = os.path.join(CAND, "danhsach.json")
NGUON = os.path.join(LIB, "nguon.json")
UA = {"User-Agent": "SuThatLichSu/1.0 (personal history video project)"}
API = "https://commons.wikimedia.org/w/api.php"


def get(url, timeout=90, tries=5):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            # Commons giới hạn tốc độ tải: chờ rồi thử lại
            if e.code != 429 or k == tries - 1:
                raise
            time.sleep(5 * (k + 1))


def text(s):
    """Bỏ thẻ HTML trong metadata của Commons"""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()


def load(path, default):
    return json.load(open(path, encoding="utf-8")) if os.path.exists(path) else default


def save(path, data):
    json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def tim(q, n):
    os.makedirs(CAND, exist_ok=True)
    params = dict(
        action="query", format="json", generator="search", gsrsearch=q, gsrnamespace=6, gsrlimit=min(n * 2, 100),
        prop="imageinfo", iiprop="url|size|mime|extmetadata", iiurlwidth=1920,
    )
    data = json.loads(get(API + "?" + urllib.parse.urlencode(params)))
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    items = []
    for p in pages:
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") not in ("image/jpeg", "image/png", "image/svg+xml", "image/tiff"):
            continue
        if max(ii.get("width", 0), ii.get("height", 0)) < 700:
            continue
        m = ii.get("extmetadata", {})
        items.append(dict(
            title=p["title"],
            url=ii.get("thumburl") or ii["url"],
            w=ii.get("width"), h=ii.get("height"),
            author=text(m.get("Artist", {}).get("value")) or "không rõ",
            license=text(m.get("LicenseShortName", {}).get("value")) or "không rõ",
            date=text(m.get("DateTimeOriginal", {}).get("value")),
            desc=text(m.get("ImageDescription", {}).get("value"))[:200],
            source=ii.get("descriptionurl"),
        ))
        if len(items) >= n:
            break

    meta = load(META, {})
    have = {v["title"]: k for k, v in meta.items()}
    nxt = max([int(k) for k in meta] + [0]) + 1
    todo = []
    for it in items:
        if it["title"] in have:
            continue
        ext = ".png" if it["url"].lower().endswith(".png") else ".jpg"
        it["file"] = f"{nxt:03d}{ext}"
        it["q"] = q
        meta[str(nxt)] = it
        todo.append(it)
        nxt += 1

    def dl(it):
        try:
            data = get(it["url"])
            open(os.path.join(CAND, it["file"]), "wb").write(data)
            time.sleep(1)  # tải từ từ để Commons không chặn
            return True
        except Exception as e:  # ảnh lỗi thì bỏ qua, không dừng cả mẻ
            print("  lỗi", it["title"], e)
            return False

    with ThreadPoolExecutor(1) as ex:
        ok = list(ex.map(dl, todo))
    for it, good in zip(todo, ok):
        if not good:
            meta = {k: v for k, v in meta.items() if v is not it}
    save(META, meta)
    for k, v in meta.items():
        if v.get("q") == q:
            print(f"  {k:>4}  {v['license']:<16} {v['title'][5:80]}")
    xem(meta)
    print("Xem ảnh:", os.path.join(CAND, "xem.html"))


def xem(meta):
    cards = "".join(
        f'<figure><img src="{v["file"]}" loading="lazy"><figcaption><b>{k}</b> · {html.escape(v["license"])}<br>'
        f'{html.escape(v["title"][5:])}<br><small>{html.escape(v["q"])}</small></figcaption></figure>'
        for k, v in sorted(meta.items(), key=lambda kv: -int(kv[0]))
    )
    open(os.path.join(CAND, "xem.html"), "w", encoding="utf-8").write(
        "<!doctype html><meta charset=utf-8><title>Ảnh ứng viên</title><style>"
        "body{background:#111;color:#ddd;font:14px sans-serif;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;padding:12px}"
        "figure{margin:0;background:#222;padding:8px}img{width:100%;height:220px;object-fit:contain;background:#000}b{color:#fc6;font-size:20px}"
        f"</style>{cards}")


def chon(ids, ten):
    meta = load(META, {})
    nguon = load(NGUON, [])
    have = {m.get("source") for m in nguon}
    for i in ids:
        it = meta.get(str(i))
        if not it:
            print("  không có ảnh số", i)
            continue
        if it["source"] in have:
            print("  đã có:", it["title"])
            continue
        ext = os.path.splitext(it["file"])[1]
        k = 1
        while os.path.exists(os.path.join(LIB, f"{ten}_{k:02d}{ext}")):
            k += 1
        fn = f"{ten}_{k:02d}{ext}"
        shutil.copy(os.path.join(CAND, it["file"]), os.path.join(LIB, fn))
        nguon.append(dict(file=fn, title=it["title"][5:], author=it["author"], license=it["license"], date=it["date"], source=it["source"]))
        print("  +", fn, "←", it["title"][5:])
    save(NGUON, nguon)
    subprocess.run([sys.executable, os.path.join(ROOT, "tools", "cap_nhat_thuvien.py")], check=True)


def in_nguon():
    for m in load(NGUON, []):
        if "Wikimedia" in m.get("source", "") or "wikimedia" in m.get("source", ""):
            print(f"- {m['title']} — {m['author']} ({m['license']}), Wikimedia Commons")
        else:
            print(f"- {m['file']} — {m.get('author', '')} {m.get('license', '')} {m.get('source', '')}".rstrip())


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        print(__doc__)
    elif a[0] == "tim":
        tim(a[1], int(a[2]) if len(a) > 2 else 30)
    elif a[0] == "chon":
        ten = "anh"
        if "--ten" in a:
            j = a.index("--ten")
            ten = a[j + 1]
            a = a[:j] + a[j + 2:]
        chon([int(x) for x in a[1:]], ten)
    elif a[0] == "nguon":
        in_nguon()
