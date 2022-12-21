from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from uuid import UUID

router = APIRouter(tags=["ui"], prefix="")
templates = Jinja2Templates(directory="templates")


@router.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")


@router.get(path="/ui", response_class=HTMLResponse)
def ui(request: Request, session: UUID | None = None):
    context = {"request": request, "session": session}
    output = templates.TemplateResponse("ui.html", context)
    return output
