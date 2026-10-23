from collections import deque
from typing import Any


def validate_dfa_for_minimization(
    states: list[str],
    alphabet: list[str],
    transitions: dict[str, str],
    start_state: str,
    final_states: list[str],
) -> list[str]:
    errors: list[str] = []
    if not states:
        errors.append("DFA must contain at least one state.")
    if len(states) != len(set(states)):
        errors.append("DFA states must be unique.")
    if not alphabet:
        errors.append("DFA alphabet cannot be empty.")
    if len(alphabet) != len(set(alphabet)):
        errors.append("DFA alphabet symbols must be unique.")
    if any(not state for state in states):
        errors.append("DFA states must be non-empty strings.")
    if any(not symbol for symbol in alphabet):
        errors.append("DFA alphabet symbols must be non-empty strings.")
    if any(len(symbol) != 1 for symbol in alphabet):
        errors.append("DFA alphabet symbols must be single characters.")
    if start_state not in states:
        errors.append(f"Start state '{start_state}' is not present in the state set.")
    for state in final_states:
        if state not in states:
            errors.append(f"Final state '{state}' is not present in the state set.")
    if not isinstance(transitions, dict):
        errors.append("DFA transitions must be an object.")
        return errors

    state_set = set(states)
    alphabet_set = set(alphabet)
    for key, target in transitions.items():
        if not isinstance(key, str):
            errors.append(f"Invalid transition key '{key}'. Use 'state,symbol'.")
            continue
        source, separator, symbol = key.partition(",")
        if not separator or not source or not symbol:
            errors.append(f"Invalid transition key '{key}'. Use 'state,symbol'.")
            continue
        if source not in state_set:
            errors.append(f"Transition source '{source}' is not present in the state set.")
        if symbol not in alphabet_set:
            errors.append(f"Transition symbol '{symbol}' is not present in the DFA alphabet.")
        if target not in state_set:
            errors.append(f"Transition δ({source}, {symbol}) points to unknown state '{target}'.")

    for state in states:
        for symbol in alphabet:
            if f"{state},{symbol}" not in transitions:
                errors.append(f"Missing transition: δ({state}, {symbol}).")
    return errors


def _reachable_states(
    start_state: str,
    alphabet: list[str],
    transitions: dict[str, str],
) -> list[str]:
    reachable: set[str] = set()
    pending = deque([start_state])
    while pending:
        state = pending.popleft()
        if state in reachable:
            continue
        reachable.add(state)
        for symbol in alphabet:
            target = transitions.get(f"{state},{symbol}")
            if target is not None and target not in reachable:
                pending.append(target)
    return sorted(reachable)


def _partition_snapshot(partitions: list[list[str]]) -> list[list[str]]:
    return [sorted(partition) for partition in partitions if partition]


def minimize_dfa(
    states: list[str],
    alphabet: list[str],
    transitions: dict[str, str],
    start_state: str,
    final_states: list[str],
) -> dict[str, Any]:
    """Remove unreachable states, refine equivalent-state partitions, and build a DFA."""
    errors = validate_dfa_for_minimization(
        states, alphabet, transitions, start_state, final_states
    )
    if errors:
        raise ValueError("; ".join(errors))

    reachable = _reachable_states(start_state, alphabet, transitions)
    reachable_set = set(reachable)
    reachable_finals = sorted(set(final_states).intersection(reachable_set))
    reachable_non_finals = sorted(reachable_set.difference(reachable_finals))

    partitions = [partition for partition in [reachable_finals, reachable_non_finals] if partition]
    stages: list[dict[str, Any]] = [
        {
            "stage": "reachable",
            "partitions": [reachable],
            "explanation": f"Removed {len(set(states).difference(reachable_set))} unreachable state(s).",
        },
        {
            "stage": "initial_partition",
            "partitions": _partition_snapshot(partitions),
            "explanation": "Separate accepting and non-accepting reachable states.",
        },
    ]

    while True:
        partition_index = {
            state: index
            for index, partition in enumerate(partitions)
            for state in partition
        }
        refined: list[list[str]] = []
        changed = False
        for partition in partitions:
            groups: dict[tuple[int | None, ...], list[str]] = {}
            for state in sorted(partition):
                signature = tuple(
                    partition_index.get(transitions.get(f"{state},{symbol}"))
                    for symbol in alphabet
                )
                groups.setdefault(signature, []).append(state)
            refined.extend(groups.values())
            if len(groups) > 1:
                changed = True

        refined = _partition_snapshot(refined)
        stages.append({
            "stage": "refinement",
            "partitions": refined,
            "explanation": (
                "Split states with different transition signatures."
                if changed
                else "No partition changed; all remaining states are equivalent."
            ),
        })
        partitions = refined
        if not changed:
            break

    state_names = {
        state: f"M{index}"
        for index, partition in enumerate(partitions)
        for state in partition
    }
    minimized_states = [f"M{index}" for index in range(len(partitions))]
    minimized_transitions: dict[str, str] = {}
    for index, partition in enumerate(partitions):
        representative = partition[0]
        for symbol in alphabet:
            target = transitions.get(f"{representative},{symbol}")
            minimized_transitions[f"M{index},{symbol}"] = state_names[target]

    minimized_finals = [
        state_names[partition[0]]
        for partition in partitions
        if set(partition).intersection(reachable_finals)
    ]

    return {
        "reachable_states": reachable,
        "stages": stages,
        "state_mapping": [
            {"minimized_state": f"M{index}", "original_states": partition}
            for index, partition in enumerate(partitions)
        ],
        "dfa": {
            "states": minimized_states,
            "alphabet": alphabet,
            "transitions": minimized_transitions,
            "start_state": state_names[start_state],
            "final_states": minimized_finals,
        },
    }
