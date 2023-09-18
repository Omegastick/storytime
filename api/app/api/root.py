from litestar import Router, get


@get("/health")
async def health_check() -> str:
    return "ok"


root_router = Router("/", route_handlers=[health_check])
