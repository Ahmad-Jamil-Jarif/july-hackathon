"""Package for route modules.

This module re-exports the parent `app` package's `config` so that
relative imports like `from .. import config` inside subpackages
(e.g. `app.routes.factcheck`) continue to work.
"""

from .. import (
	config as config,
	db as db,
	models as models,
	ratelimit as ratelimit,
	schemas as schemas,
	services as services,
)

__all__ = ["config", "db", "models", "ratelimit", "schemas", "services"]

