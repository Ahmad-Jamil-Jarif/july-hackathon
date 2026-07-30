#!/usr/bin/env python3
import sys, base64
path = sys.argv[1]
b64 = sys.argv[2]
import pathlib
p = pathlib.Path(path)
p.parent.mkdir(parents=True, exist_ok=True)
p.write_bytes(base64.b64decode(b64))
print(f'wrote {path} ({len(b64)} b64 chars)')

