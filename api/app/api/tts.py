from app.tts.xtts import XTTSModel
from litestar import Response, Router, post
from pydantic import BaseModel


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None


@post("/")
async def tts(data: TTSRequest, xtts_model: XTTSModel) -> Response[bytes]:
    kwargs = {}
    if data.voice is not None:
        kwargs["voice"] = data.voice

    audio = xtts_model.generate_audio(data.text, **kwargs)

    return Response(audio, media_type="audio/wav")


tts_router = Router("/tts", route_handlers=[tts])
