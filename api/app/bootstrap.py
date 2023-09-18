from litestar import Litestar

from .api.root import root_router

app = Litestar(route_handlers=[root_router])
