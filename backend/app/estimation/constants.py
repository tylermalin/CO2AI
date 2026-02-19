"""Hardware efficiency and physical constants for carbon estimation."""

# Hardware efficiency: FLOPs per Joule (typical inference values)
H100_FP8_FLOPS_PER_JOULE = 1.0e11  # ~4 TFLOPS/W
A100_FP16_FLOPS_PER_JOULE = 6.0e10  # ~2.5 TFLOPS/W

DEFAULT_PUE = 1.2
JOULES_PER_KWH = 3_600_000
