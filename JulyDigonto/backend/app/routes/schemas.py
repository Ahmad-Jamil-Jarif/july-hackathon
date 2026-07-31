"""Shim: re-export app.schemas as app.routes.schemas"""
from ..schemas import *

__all__ = [name for name in globals() if not name.startswith("_")]
