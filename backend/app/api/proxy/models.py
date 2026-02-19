"""Model name to active params mapping. Configurable via env in future."""

# Model name (or prefix) -> active params. Fallback: config.default_model_params
MODEL_PARAMS: dict[str, int] = {
    "gpt-4o": 220_000_000_000,
    "gpt-4o-mini": 7_000_000_000,
    "gpt-4-turbo": 220_000_000_000,
    "gpt-4": 220_000_000_000,
    "gpt-3.5-turbo": 20_000_000_000,
    "gpt-3.5-turbo-16k": 20_000_000_000,
    "o1": 70_000_000_000,
    "o1-mini": 7_000_000_000,
}


def get_active_params(model: str, default: int) -> int:
    """Resolve model name to active params. Uses prefix match."""
    for prefix, params in MODEL_PARAMS.items():
        if model.startswith(prefix) or model == prefix:
            return params
    return default
