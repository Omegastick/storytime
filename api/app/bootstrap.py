from litestar import Litestar
from litestar.config.cors import CORSConfig

from .api.root import root_router
from .api.tts import tts_router
from .tts.inject import inject as inject_tts

app = Litestar(route_handlers=[root_router, tts_router], dependencies={**inject_tts()}, cors_config=CORSConfig())
