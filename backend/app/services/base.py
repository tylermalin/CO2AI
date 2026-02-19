"""Base service class for dependency injection."""

from abc import ABC
from typing import Any


class BaseService(ABC):
    """Abstract base for injectable services."""

    def __init__(self, **kwargs: Any) -> None:
        """Initialize with optional dependencies."""
        for key, value in kwargs.items():
            setattr(self, key, value)
