"""Shim: re-export app.config as app.routes.config"""
from ..config import *  # re-export everything from parent package's config

__all__ = [name for name in globals() if not name.startswith("_")]
