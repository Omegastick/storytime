from app.tts.tts_queue import TTSQueue
from litestar import Response, Router, post
from pydantic import BaseModel


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None


@post("/")
async def tts(data: TTSRequest, tts_queue: TTSQueue) -> Response[bytes]:
    kwargs = {}
    if data.voice is not None:
        kwargs["voice"] = data.voice

    audio = await tts_queue.generate_audio(data.text, **kwargs)

    return Response(audio, media_type="audio/wav")


tts_router = Router("/tts", route_handlers=[tts])
