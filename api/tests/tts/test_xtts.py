from pathlib import Path
from typing import Generator
from unittest.mock import Mock, patch

import numpy as np
import pytest
from app.tts.xtts import XTTSModel
from TTS.tts.models.xtts import Xtts

FAKE_CONFIG_PATH = Path("/fake/config/path")
FAKE_CHECKPOINT_DIR = Path("/fake/checkpoint/dir")


@pytest.fixture()
def xtts_model() -> XTTSModel:
    with patch("app.tts.xtts.XttsConfig", autospec=True):
        return XTTSModel(FAKE_CONFIG_PATH, FAKE_CHECKPOINT_DIR)


@pytest.fixture()
def mock_xtts() -> Generator[Mock, None, None]:
    with patch("app.tts.xtts.Xtts", autospec=True) as mock_xtts:
        mock_xtts.init_from_config.return_value = Mock(spec=Xtts)
        mock_xtts.init_from_config.return_value.synthesize.return_value = {"wav": np.array([1, 2, 3], dtype=np.float32)}
        yield mock_xtts


def test_generate_audio_loads_model(
    mock_xtts: Mock,
    xtts_model: XTTSModel,
):
    xtts_model.generate_audio("test")

    mock_xtts.init_from_config.assert_called_once_with(xtts_model.config)
    mock_xtts.init_from_config.return_value.load_checkpoint.assert_called_once_with(
        xtts_model.config, checkpoint_dir=FAKE_CHECKPOINT_DIR, eval=True
    )
    mock_xtts.init_from_config.return_value.cuda.assert_called_once_with()


def test_generate_audio_generates_audio(
    mock_xtts: Mock,
    xtts_model: XTTSModel,
):
    audio = xtts_model.generate_audio("test")

    assert audio.startswith(b"RIFF")


def test_generate_audio_passes_kwargs_to_synthesize(
    mock_xtts: Mock,
    xtts_model: XTTSModel,
):
    xtts_model.generate_audio("test", voice="fake_voice", gpt_cond_len=5, language="en")

    mock_xtts.init_from_config.return_value.synthesize.assert_called_once_with(
        "test",
        xtts_model.config,
        speaker_wav="fake_voice",
        gpt_cond_len=5,
        language="en",
    )
