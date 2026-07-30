#!/usr/bin/env python3
# JulyDigonto project emitter - writes all source files as base64 payloads in scripts/payloads/
from __future__ import annotations
import base64, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAYLOADS = ROOT / 'scripts' / 'payloads'
PAYLOADS.mkdir(parents=True, exist_ok=True)

FILES = {}



