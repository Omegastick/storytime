import asyncio
from asyncio.futures import Future
from typing import Generator
from unittest.mock import AsyncMock

import pytest
from app.tts.tts_queue import TTSQueue


@pytest.fixture
def mock_tts_model() -> AsyncMock:
    mock = AsyncMock()
    mock.generate_audio.return_value = b"audio_data"
    return mock


@pytest.fixture
def tts_queue(mock_tts_model: AsyncMock) -> TTSQueue:
    return TTSQueue(mock_tts_model)


@pytest.mark.asyncio
async def test_generate_audio(tts_queue: TTSQueue) -> None:
    result: bytes = await tts_queue.generate_audio("text")
    assert result == b"audio_data"


@pytest.mark.asyncio
async def test_generate_multiple_audio(tts_queue: TTSQueue, mock_tts_model: AsyncMock) -> None:
    mock_tts_model.generate_audio.side_effect = [b"audio_data_1", b"audio_data_2"]

    result_1: bytes = await tts_queue.generate_audio("text_1")
    result_2: bytes = await tts_queue.generate_audio("text_2")

    assert result_1 == b"audio_data_1"
    assert result_2 == b"audio_data_2"


@pytest.mark.asyncio
async def test_gather_retains_order(tts_queue: TTSQueue, mock_tts_model: AsyncMock) -> None:
    mock_tts_model.generate_audio.side_effect = [b"audio_data_" + str(i).encode() for i in range(10)]

    results: Generator[Future[bytes], None, None] = (tts_queue.generate_audio("text_" + str(i)) for i in range(10))
    gathered_results: list[bytes] = await asyncio.gather(*results)

    assert gathered_results == [b"audio_data_" + str(i).encode() for i in range(10)]


@pytest.mark.asyncio
async def test_tts_model_isnt_called_simultaneously(tts_queue: TTSQueue, mock_tts_model: AsyncMock) -> None:
    currrently_working = False

    async def fake_work_with_flag(text: str) -> bytes:
        nonlocal currrently_working
        assert not currrently_working
        currrently_working = True
        await asyncio.sleep(0.1)
        currrently_working = False
        return b"audio_data"

    mock_tts_model.generate_audio.side_effect = fake_work_with_flag

    results: Generator[Future[bytes], None, None] = (tts_queue.generate_audio("text_" + str(i)) for i in range(3))

    await asyncio.gather(*results)


@pytest.mark.asyncio
async def test_exceptions_are_propagated(tts_queue: TTSQueue, mock_tts_model: AsyncMock) -> None:
    mock_tts_model.generate_audio.side_effect = Exception("test")

    with pytest.raises(Exception):
        await tts_queue.generate_audio("text")
