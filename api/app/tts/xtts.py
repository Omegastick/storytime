import logging
from io import BytesIO
from pathlib import Path

import soundfile
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts

from .tts_model import TTSModel

logger = logging.getLogger(__name__)


class XTTSModel(TTSModel):
    def __init__(self, config_path: Path, checkpoint_dir: Path):
        self.config = XttsConfig()
        logger.info(f"Loading XTTS config from {config_path}")
        self.config.load_json(config_path)

        self.checkpoint_dir = checkpoint_dir

        self.model: Xtts | None = None

    def _load_model(self) -> Xtts:
        logger.info("Loading XTTS model")
        model = Xtts.init_from_config(self.config)
        model.load_checkpoint(self.config, checkpoint_dir=self.checkpoint_dir, eval=True)
        model.cuda()
        return model

    def generate_audio(self, text: str, **kwargs) -> bytes:
        if self.model is None:
            self.model = self._load_model()

        outputs = self.model.synthesize(
            text,
            self.config,
            speaker_wav=kwargs.get("voice", "/home/omega/voices/peter-dann-1.wav"),
            gpt_cond_len=kwargs.get("gpt_cond_len", 5),
            language=kwargs.get("language", "en"),
        )

        buffer = BytesIO()
        with buffer as f:
            soundfile.write(f, outputs["wav"], samplerate=22050, format="wav", subtype="PCM_16")
            f.seek(0)
            return buffer.getvalue()
