"""FLOPs per token calculation for decoder-only Transformer inference."""

FLOPS_PER_TOKEN_FACTOR = 2


def flops_per_token(active_params: int) -> int:
    """FLOPs for a single token (forward pass).

    Formula: 2 × active_params (decoder-only Transformer).
    """
    return FLOPS_PER_TOKEN_FACTOR * active_params


def total_flops(active_params: int, token_count: int) -> int:
    """Total FLOPs for a request (input + output tokens)."""
    return flops_per_token(active_params) * token_count
