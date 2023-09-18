import os
from pathlib import Path
from typing import Any

from litestar.di import Provide

from .xtts import XTTSModel


async def make_xtts() -> XTTSModel:
    return XTTSModel(
        config_path=Path(os.environ.get("ST_XTTS_CONFIG_PATH", "/home/omega/models/xtts/config.json")),
        checkpoint_dir=Path(os.environ.get("ST_XTTS_CHECKPOINT_DIR", "/home/omega/models/xtts/")),
        voices_dir=Path(os.environ.get("ST_XTTS_VOICES_DIR", "/home/omega/voices/")),
    )


def inject() -> dict[str, Any]:
    return {
        "xtts_model": Provide(make_xtts, use_cache=True),
    }
