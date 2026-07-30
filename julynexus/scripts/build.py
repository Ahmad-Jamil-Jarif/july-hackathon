#!/usr/bin/env python3
# JulyDigonto project builder - reads payloads from scripts/payloads/*.bin
from __future__ import annotations
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAYLOADS = ROOT / 'scripts' / 'payloads'
COUNT = 0

def main():
    global COUNT
    for bin_file in sorted(PAYLOADS.glob('*.bin')):
        rel = bin_file.stem.replace('--', '/')
        content = bin_file.read_bytes().decode('utf-8')
        out = ROOT / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(content, encoding='utf-8')
        COUNT += 1
        print(f'wrote {rel} ({len(content)} bytes)')
    print(f'done. {COUNT} files written.')

if __name__ == '__main__':
    main()

