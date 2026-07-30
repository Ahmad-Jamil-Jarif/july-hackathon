#!/usr/bin/env python3
# Usage: python encode.py <encoded-path> <base64-content>
import sys, base64, pathlib
encoded_path, b64 = sys.argv[1], sys.argv[2]
PAYLOADS = pathlib.Path(__file__).resolve().parent / 'payloads'
PAYLOADS.mkdir(exist_ok=True)
out = PAYLOADS / (encoded_path + '.bin')
out.write_bytes(base64.b64decode(b64))
print('encoded ' + encoded_path)

