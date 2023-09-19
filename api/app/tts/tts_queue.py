import asyncio

from .tts_model import TTSModel


class TTSQueue:
    def __init__(self, tts_model: TTSModel):
        self.tts_model = tts_model
        self.queue: asyncio.Queue[tuple[str, dict, asyncio.Future[bytes]]] = asyncio.Queue()
        self.loop = asyncio.get_event_loop()
        self.loop.create_task(self._process_queue())

    async def _process_queue(self):
        while True:
            text, kwargs, future = await self.queue.get()
            try:
                audio = await self.tts_model.generate_audio(text, **kwargs)
                future.set_result(audio)
            except Exception as e:
                future.set_exception(e)

    async def generate_audio(self, text: str, **kwargs) -> bytes:
        future = self.loop.create_future()
        await self.queue.put((text, kwargs, future))
        return await future
