"""Shim: re-export app.ratelimit as app.routes.ratelimit"""
from ..ratelimit import *

__all__ = [name for name in globals() if not name.startswith("_")]
