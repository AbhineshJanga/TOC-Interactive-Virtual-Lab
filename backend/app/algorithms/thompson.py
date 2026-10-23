from typing import Any

EPSILON = "ε"


def thompson_from_postfix(postfix: list[str]) -> dict[str, Any]:
    states: list[str] = []
    transitions: dict[str, list[str]] = {}
    counter = 0
    fragments: list[tuple[str, str]] = []

    def new_state() -> str:
        nonlocal counter
        state = f"q{counter}"
        counter += 1
        states.append(state)
        return state

    def add_transition(source: str, symbol: str, target: str) -> None:
        transitions.setdefault(f"{source},{symbol}", []).append(target)

    for token in postfix:
        if token not in {"|", ".", "*"}:
            start, end = new_state(), new_state()
            add_transition(start, token, end)
            fragments.append((start, end))
        elif token == ".":
            if len(fragments) < 2:
                raise ValueError("Invalid concatenation expression.")
            left_start, left_end = fragments.pop(-2)
            right_start, right_end = fragments.pop()
            add_transition(left_end, EPSILON, right_start)
            fragments.append((left_start, right_end))
        elif token == "|":
            if len(fragments) < 2:
                raise ValueError("Union requires two expressions.")
            left_start, left_end = fragments.pop(-2)
            right_start, right_end = fragments.pop()
            start, end = new_state(), new_state()
            add_transition(start, EPSILON, left_start)
            add_transition(start, EPSILON, right_start)
            add_transition(left_end, EPSILON, end)
            add_transition(right_end, EPSILON, end)
            fragments.append((start, end))
        else:
            if not fragments:
                raise ValueError("Kleene star requires an expression.")
            inner_start, inner_end = fragments.pop()
            start, end = new_state(), new_state()
            add_transition(start, EPSILON, inner_start)
            add_transition(start, EPSILON, end)
            add_transition(inner_end, EPSILON, inner_start)
            add_transition(inner_end, EPSILON, end)
            fragments.append((start, end))

    if len(fragments) != 1:
        raise ValueError("Invalid regular expression.")
    start_state, final_state = fragments[0]
    alphabet = sorted({symbol for key in transitions for symbol in [key.split(",", 1)[1]] if symbol != EPSILON})
    return {
        "states": states,
        "alphabet": alphabet,
        "transitions": transitions,
        "start_state": start_state,
        "final_states": [final_state],
    }
