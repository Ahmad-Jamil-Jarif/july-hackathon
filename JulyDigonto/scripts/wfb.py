#!/usr/bin/env python3
# Usage: python wfb.py <path>
# Reads base64 from stdin, writes decoded bytes to <path>.
import sys, base64, pathlib
path = sys.argv[1]
b64 = sys.stdin.read().strip()
p = pathlib.Path(path)
p.parent.mkdir(parents=True, exist_ok=True)
p.write_bytes(base64.b64decode(b64))
print(f'wrote {path} ({p.stat().st_size} bytes)')

