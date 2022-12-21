from random import randint as random_int, choice as random_choice
from .models import Die, NumericalDie, NamedDie, RollResult


def roll(input: list[NumericalDie]) -> RollResult:
    final_value = 0
    rolls = []
    for die in input:
        result = roll_numerical_die(die)
        rolls.append(result)
        final_value += result
    output = RollResult(rolls=rolls, final_value=final_value)
    return output


def roll_die(input: Die) -> int | str:
    if isinstance(input, NamedDie):
        return roll_named_die(input)
    if isinstance(input, NumericalDie):
        return roll_numerical_die(input)
    e = "roll_die must be called with a NumericalDie or NamedDie object, got "
    e += "object of type" + str(type(input))
    raise ValueError(e)


def roll_named_die(input: NamedDie) -> str:
    if not isinstance(input, NamedDie):
        e = "roll_named_die must be called with a NamedDie object, got "
        e += "object of type" + str(type(input))
        raise ValueError(e)
    return random_choice(input.sides)


def roll_numerical_die(input: NumericalDie) -> int:
    if not isinstance(input, NumericalDie):
        e = "roll_numerical_die must be called with a NumericalDie object, got "
        e += "object of type" + str(type(input))
        raise ValueError(e)
    return random_int(1, input.sides)
