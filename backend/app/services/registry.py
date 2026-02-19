"""Registry loader for service dependency injection."""

from typing import Any, TypeVar

T = TypeVar("T")


class ServiceRegistry:
    """Registry for lazy-loaded services. Enables clean dependency injection."""

    _instances: dict[str, Any] = {}
    _factories: dict[str, tuple[type, dict[str, Any]]] = {}

    @classmethod
    def register(
        cls,
        name: str,
        service_class: type,
        **deps: Any,
    ) -> None:
        """Register a service class with optional dependencies."""
        cls._factories[name] = (service_class, deps)

    @classmethod
    def get(cls, name: str) -> Any:
        """Get or create a service instance."""
        if name not in cls._instances:
            if name not in cls._factories:
                raise KeyError(f"Service not registered: {name}")
            service_class, deps = cls._factories[name]
            cls._instances[name] = service_class(**deps)
        return cls._instances[name]

    @classmethod
    def clear(cls) -> None:
        """Clear all instances (for testing)."""
        cls._instances.clear()


def get_service(name: str) -> Any:
    """Dependency that resolves a service from the registry."""
    return ServiceRegistry.get(name)
