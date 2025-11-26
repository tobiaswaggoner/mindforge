"""Task handlers for different task types.

Import this module to register all handlers with the TaskHandlerRegistry.
"""

# Import handlers to trigger registration
from .stub_handler import StubHandler

__all__ = [
    "StubHandler",
]
