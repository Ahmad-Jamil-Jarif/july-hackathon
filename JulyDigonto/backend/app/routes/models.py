"""Shim: re-export app.models as app.routes.models"""
from ..models import *

__all__ = [name for name in globals() if not name.startswith("_")]
