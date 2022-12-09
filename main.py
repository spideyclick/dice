from uvicorn import run as run_uvicorn_app
from fastapi import FastAPI
from routers.main import router as base_router


@base_router.get("/version")
def get_version() -> str:
    output = app.version
    return output


@base_router.get("/urls")
def getUrls() -> list[dict]:
    """Get all urls available in the api. Should probably use /openapi.json
    instead."""
    output = []
    for route in app.routes:
        filtered_route_object = {
            "path": route.path,
            "name": route.name,
            "methods": route.methods,
        }
        output.append(filtered_route_object)
    return output


def main() -> None:
    run_uvicorn_app(app, host="0.0.0.0", port=80, reload=False)


app = FastAPI(
    title="Dice API",
    description="An API for rolling dice",
    version="0.1.0",
)
app.include_router(base_router)

if __name__ == "__main__":
    main()
