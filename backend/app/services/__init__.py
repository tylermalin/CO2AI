"""Service layer - modular, registry-loaded."""

from app.services.registry import get_service, ServiceRegistry

__all__ = ["get_service", "ServiceRegistry"]
