#!/usr/bin/env python3
"""Create all tables (dev migration). Load .env, run Base.metadata.create_all."""

import asyncio
import os
import sys

# Add backend to path for app imports
_backend = os.path.join(os.path.dirname(__file__), "..", "backend")
if _backend not in sys.path:
    sys.path.insert(0, _backend)
os.chdir(_backend)

# Load .env before importing app (which uses config)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


async def main() -> None:
    from app.db import init_db

    await init_db()
    print("Tables created successfully.")


if __name__ == "__main__":
    asyncio.run(main())
