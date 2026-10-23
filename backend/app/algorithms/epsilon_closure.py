from collections.abc import Mapping, Sequence

EPSILON = "ε"


def epsilon_closure(
    states: Sequence[str],
    transitions: Mapping[str, list[str]],
) -> list[str]:
    """Return every state reachable from states using only epsilon edges."""
    closure = set(states)
    pending = list(states)

    while pending:
        state = pending.pop()
        for target in transitions.get(f"{state},{EPSILON}", []):
            if target not in closure:
                closure.add(target)
                pending.append(target)

    return sorted(closure)
