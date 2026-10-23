from typing import Any

from app.algorithms.epsilon_closure import EPSILON, epsilon_closure


def validate_epsilon_nfa(machine: dict[str, Any]) -> dict[str, Any]:
    """Validate an epsilon-NFA, allowing ε transitions outside its alphabet."""
    errors: list[str] = []
    states = machine.get("states", [])
    alphabet = machine.get("alphabet", [])
    start_state = machine.get("start_state")
    final_states = machine.get("final_states", [])
    transitions = machine.get("transitions", {})

    if not states:
        errors.append("ε-NFA must contain at least one state.")
    if len(states) != len(set(states)):
        errors.append("ε-NFA states must be unique.")
    if not alphabet:
        errors.append("ε-NFA alphabet cannot be empty.")
    if EPSILON in alphabet:
        errors.append("ε must be represented as a transition label, not an input symbol.")
    if len(alphabet) != len(set(alphabet)):
        errors.append("ε-NFA alphabet symbols must be unique.")
    if any(not isinstance(symbol, str) or len(symbol) != 1 for symbol in alphabet):
        errors.append("ε-NFA alphabet symbols must be single characters.")
    if start_state not in states:
        errors.append(f"Start state '{start_state}' is not present in the state set.")
    for state in final_states:
        if state not in states:
            errors.append(f"Final state '{state}' is not present in the state set.")

    if not isinstance(transitions, dict):
        errors.append("ε-NFA transitions must be an object.")
    else:
        for transition_key, targets in transitions.items():
            source, separator, symbol = transition_key.partition(",")
            if not separator:
                errors.append(f"Invalid transition key '{transition_key}'. Use 'state,symbol'.")
                continue
            if source not in states:
                errors.append(f"Transition source '{source}' is not present in the state set.")
            if symbol != EPSILON and symbol not in alphabet:
                errors.append(f"Transition symbol '{symbol}' is not present in the ε-NFA alphabet.")
            if not isinstance(targets, list) or not targets:
                errors.append(f"Transition δ({source}, {symbol}) must contain at least one target state.")
                continue
            for target in targets:
                if target not in states:
                    errors.append(f"Transition δ({source}, {symbol}) points to unknown state '{target}'.")

    return {"valid": not errors, "errors": errors}


def simulate_epsilon_nfa(
    states: list[str],
    alphabet: list[str],
    transitions: dict[str, list[str]],
    start_state: str,
    final_states: list[str],
    input_string: str,
) -> dict[str, Any]:
    """Simulate an ε-NFA using closure before and after every input symbol."""
    del states
    current_states = epsilon_closure([start_state], transitions)
    trace: list[dict[str, Any]] = [{
        "step": 0,
        "symbol": None,
        "closure_before": [start_state],
        "current_states": current_states,
        "next_states": current_states,
        "transitions": [],
        "explanation": f"Start with ε-closure({{{start_state}}}) = {{{', '.join(current_states)}}}.",
    }]

    for step, symbol in enumerate(input_string, start=1):
        if symbol not in alphabet:
            return {
                "accepted": False,
                "final_states": current_states,
                "trace": trace,
                "error": f"Symbol '{symbol}' is not present in the ε-NFA alphabet.",
                "explanation": "The input contains a symbol outside the ε-NFA alphabet.",
            }
        move_states: set[str] = set()
        transition_steps: list[dict[str, str]] = []
        for state in current_states:
            for target in transitions.get(f"{state},{symbol}", []):
                move_states.add(target)
                transition_steps.append({"source": state, "symbol": symbol, "target": target})

        next_states = epsilon_closure(sorted(move_states), transitions)
        trace.append({
            "step": step,
            "symbol": symbol,
            "closure_before": current_states,
            "move_states": sorted(move_states),
            "current_states": current_states,
            "next_states": next_states,
            "transitions": transition_steps,
            "explanation": (
                f"Read '{symbol}', move to {{{', '.join(sorted(move_states)) or '∅'}}}, "
                f"then apply ε-closure to get {{{', '.join(next_states) or '∅'}}}."
            ),
        })
        current_states = next_states

    accepting_states = sorted(set(current_states).intersection(final_states))
    accepted = bool(accepting_states)
    return {
        "accepted": accepted,
        "final_states": current_states,
        "accepting_states": accepting_states,
        "trace": trace,
        "error": None,
        "explanation": (
            f"Input completely consumed and an accepting path ends in {{{', '.join(accepting_states)}}}."
            if accepted
            else "Input completely consumed, but no active path ends in an accepting state."
        ),
    }
