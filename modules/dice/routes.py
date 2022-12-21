from fastapi import APIRouter
from .models import NumericalDie, RollResult
from . import roll

router = APIRouter(tags=["dice"], prefix="")


@router.post(path="/roll", response_model=RollResult)
def roll_dice(input: list[NumericalDie]) -> RollResult:
    result = roll(input)
    return result
