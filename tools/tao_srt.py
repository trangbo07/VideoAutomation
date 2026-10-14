"""Dự phòng khi không có file .srt: nghe giọng đọc bằng Whisper rồi xuất phụ đề theo câu.

Cách dùng:
    python tools/tao_srt.py public/tap01/giong.mp3            # -> public/tap01/sub.srt
Chậm (khoảng 0.3x thời gian thực trên CPU) — có .srt sẵn thì dùng luôn, nhanh hơn nhiều.
"""
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import os, subprocess, tempfile
from faster_whisper import WhisperModel

src = sys.argv[1]
out = os.path.join(os.path.dirname(src), "sub.srt")
wav = os.path.join(tempfile.gettempdir(), "xbook_audio16.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", wav], check=True)

model = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = model.transcribe(wav, language="vi", vad_filter=True, beam_size=5)


def ts(s):
    h, m = int(s // 3600), int(s % 3600 // 60)
    return f"{h:02d}:{m:02d}:{int(s % 60):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"


with open(out, "w", encoding="utf-8") as f:
    for i, s in enumerate(segs, 1):
        f.write(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n\n")
        print(f"{s.start:8.1f}s  {s.text.strip()}", flush=True)
print("Đã ghi", out)
