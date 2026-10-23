from typing import Any

from app.algorithms.epsilon_closure import epsilon_closure


def _targets(transitions: dict[str, list[str]], states: list[str], symbol: str) -> list[str]:
    targets: set[str] = set()
    for state in states:
        targets.update(transitions.get(f"{state},{symbol}", []))
    return sorted(targets)


def subset_construction(
    states: list[str],
    alphabet: list[str],
    transitions: dict[str, list[str]],
    start_state: str,
    final_states: list[str],
    use_epsilon_closure: bool = False,
) -> dict[str, Any]:
    """Convert an NFA/ε-NFA to a DFA and retain the derivation of every subset."""
    closure = lambda subset: epsilon_closure(subset, transitions) if use_epsilon_closure else sorted(set(subset))
    initial_subset = closure([start_state])
    subset_names: dict[tuple[str, ...], str] = {tuple(initial_subset): "D0"}
    pending = [initial_subset]
    dfa_states: list[str] = ["D0"]
    dfa_transitions: dict[str, str] = {}
    steps: list[dict[str, Any]] = []

    while pending:
        current_subset = pending.pop(0)
        current_key = tuple(current_subset)
        current_name = subset_names[current_key]
        for symbol in alphabet:
            raw_targets = _targets(transitions, current_subset, symbol)
            destination_subset = closure(raw_targets)
            destination_key = tuple(destination_subset)
            if destination_key not in subset_names:
                subset_names[destination_key] = f"D{len(subset_names)}"
                dfa_states.append(subset_names[destination_key])
                pending.append(destination_subset)

            destination_name = subset_names[destination_key]
            dfa_transitions[f"{current_name},{symbol}"] = destination_name
            steps.append({
                "dfa_state": current_name,
                "source_subset": current_subset,
                "symbol": symbol,
                "per_state_moves": [
                    {
                        "source": state,
                        "targets": transitions.get(f"{state},{symbol}", []),
                    }
                    for state in current_subset
                ],
                "raw_destination": raw_targets,
                "destination_subset": destination_subset,
                "destination_dfa_state": destination_name,
                "explanation": (
                    f"δ({{{', '.join(current_subset)}}}, {symbol}) = "
                    f"{{{', '.join(destination_subset) or '∅'}}}, so the DFA uses {destination_name}."
                ),
            })

    dfa_final_states = [
        name
        for subset, name in subset_names.items()
        if set(subset).intersection(final_states)
    ]
    subset_labels = [
        {"name": name, "subset": list(subset)}
        for subset, name in subset_names.items()
    ]

    return {
        "dfa": {
            "states": dfa_states,
            "alphabet": alphabet,
            "transitions": dfa_transitions,
            "start_state": "D0",
            "final_states": dfa_final_states,
        },
        "subsets": subset_labels,
        "steps": steps,
    }
