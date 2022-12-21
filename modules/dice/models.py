from pydantic import BaseModel
from enum import Enum

# class HttpMethod(Enum):
#     get = "GET"
#     post = "POST"
#     put = "PUT"
#     delete = "DELETE"


class Die(BaseModel):
    """Advantage favors either the highest numerical value or the earliest
    named option."""

    sides: int | list[str]
    advantage: int = 0


class NumericalDie(Die):
    """Regular dice that most people are familiar with. The classic D6 or D20
    would work here."""

    sides: int = 6
    modifier: int = 0


class NamedDie(Die):
    """Class of die with named sides."""

    sides: list[str] = ["blue", "red", "red", "red"]


class RollResult(BaseModel):
    rolls: list[int | str]
    final_value: int | str
