#!/usr/bin/env python3
"""Download the descriptions of ATHLEAN-X "Ranked (BEST TO WORST!)" videos with yt-dlp and
write each ranking (tier heading -> numbered exercises) to helper/rankings/athleanx-rankings.json
plus the raw descriptions to helper/rankings/athleanx-descriptions.md.

Run on a machine that can reach YouTube:
    pip install yt-dlp
    python3 helper/tools/fetch-athleanx-rankings.py
"""
import json, re, subprocess, sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "rankings"
SEARCH = "ytsearch60:ATHLEAN-X Exercises Ranked BEST TO WORST"
TIERS = ["WORST", "BETTER STILL", "BETTER", "ALMOST BEST", "BEST"]  # longest first where one contains another
HEADING = re.compile(r"^\W*(WORST|BETTER STILL|BETTER|ALMOST BEST|BEST)\W*$", re.I)
ITEM = re.compile(r"^\s*(\d{1,2})[.)]\s+(.+?)\s*$")


def ytdlp(*args):
    r = subprocess.run([sys.executable, "-m", "yt_dlp", *args], capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr.strip() or "yt-dlp failed")
    return r.stdout


def parse(description):
    """{tier: [exercise, ...]} in the order written; empty when the description has no ranking."""
    ranking, tier = {}, None
    # a description pasted on one line ("WORST 1. Bench Flys 2. ...") is split back into lines
    text = re.sub(r"\b(BETTER STILL|ALMOST BEST|WORST|BETTER|BEST)\b(?=\s*\d)", r"\n\1\n", description)
    text = re.sub(r"(?<=\S)\s(\d{1,2})\.\s", r"\n\1. ", text)
    for line in text.splitlines():
        m = HEADING.match(line.strip())
        if m:
            tier = m.group(1).upper()
            ranking.setdefault(tier, [])
            continue
        m = ITEM.match(line)
        if m and tier:
            ranking[tier].append(m.group(2))
    return {k: v for k, v in ranking.items() if v}


def main():
    OUT.mkdir(exist_ok=True)
    videos = []
    for line in ytdlp("--flat-playlist", "--print", "%(id)s\t%(channel)s\t%(title)s", SEARCH).splitlines():
        vid, channel, title = (line.split("\t") + ["", ""])[:3]
        if "athlean" in channel.lower() and "ranked" in title.lower():
            videos.append((vid, title))
    data, raw = {}, []
    for vid, title in videos:
        desc = ytdlp("--skip-download", "--print", "%(description)s", f"https://www.youtube.com/watch?v={vid}")
        data[vid] = {"title": title, "url": f"https://www.youtube.com/watch?v={vid}", "ranking": parse(desc)}
        raw.append(f"## {title}\n\nhttps://www.youtube.com/watch?v={vid}\n\n{desc}\n")
        print(f"{vid}  {title}  ({sum(len(v) for v in data[vid]['ranking'].values())} exercises)")
    (OUT / "athleanx-rankings.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "athleanx-descriptions.md").write_text("\n".join(raw), encoding="utf-8")


if __name__ == "__main__":
    main()
