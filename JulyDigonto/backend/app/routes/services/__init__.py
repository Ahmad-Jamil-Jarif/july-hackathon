"""Shim package to expose parent `app.services` under `app.routes.services`.

This lets imports like `from ..services.ipfs_vault.vault import vault`
work when executed from a `app.routes.*` submodule.
"""
from .. import services as services

# Point this package's __path__ to the real services package path so
# submodule imports resolve to the real implementations.
try:
    __path__ = services.__path__  # type: ignore[attr-defined]
except Exception:
    # If services isn't a package for some reason, leave __path__ alone
    pass

__all__ = ["services"]
