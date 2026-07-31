"""Shim: re-export app.db as app.routes.db"""
from ..db import *

__all__ = [name for name in globals() if not name.startswith("_")]
