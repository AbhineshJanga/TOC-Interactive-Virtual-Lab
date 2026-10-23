from typing import Any


def validate_nfa(nfa: dict[str, Any]) -> dict[str, Any]:
    """Validate an NFA structure before simulation."""
    errors: list[str] = []
    states = nfa.get("states", [])
    alphabet = nfa.get("alphabet", [])
    start_state = nfa.get("start_state")
    final_states = nfa.get("final_states", [])
    transitions = nfa.get("transitions", {})

    if not states:
        errors.append("NFA must contain at least one state.")
    if len(states) != len(set(states)):
        errors.append("NFA states must be unique.")
    if not alphabet:
        errors.append("NFA alphabet cannot be empty.")
    if len(alphabet) != len(set(alphabet)):
        errors.append("NFA alphabet symbols must be unique.")
    if any(not isinstance(symbol, str) or len(symbol) != 1 for symbol in alphabet):
        errors.append("NFA alphabet symbols must be single characters.")
    if start_state not in states:
        errors.append(f"Start state '{start_state}' is not present in the state set.")

    for state in final_states:
        if state not in states:
            errors.append(f"Final state '{state}' is not present in the state set.")

    if not isinstance(transitions, dict):
        errors.append("NFA transitions must be an object.")
    else:
        for transition_key, targets in transitions.items():
            parts = transition_key.split(",", 1)
            if len(parts) != 2:
                errors.append(f"Invalid transition key '{transition_key}'. Use 'state,symbol'.")
                continue
            source, symbol = parts
            if source not in states:
                errors.append(f"Transition source '{source}' is not present in the state set.")
            if symbol not in alphabet:
                errors.append(f"Transition symbol '{symbol}' is not present in the NFA alphabet.")
            if not isinstance(targets, list) or not targets:
                errors.append(f"Transition δ({source}, {symbol}) must contain at least one target state.")
                continue
            for target in targets:
                if target not in states:
                    errors.append(
                        f"Transition δ({source}, {symbol}) points to unknown state '{target}'."
                    )

    return {"valid": not errors, "errors": errors}


def simulate_nfa(
    states: list[str],
    alphabet: list[str],
    transitions: dict[str, list[str]],
    start_state: str,
    final_states: list[str],
    input_string: str,
) -> dict[str, Any]:
    """Simulate an NFA by tracking every state reachable after each symbol."""
    current_states = [start_state]
    trace: list[dict[str, Any]] = [
        {
            "step": 0,
            "symbol": None,
            "current_states": current_states,
            "next_states": current_states,
            "transitions": [],
            "explanation": f"Computation starts at state {{{start_state}}}.",
        }
    ]

    for step, symbol in enumerate(input_string, start=1):
        if symbol not in alphabet:
            return {
                "accepted": False,
                "final_states": current_states,
                "trace": trace,
                "error": f"Symbol '{symbol}' is not present in the NFA alphabet.",
                "explanation": "The input contains a symbol outside the NFA alphabet.",
            }

        next_states: set[str] = set()
        transition_steps: list[dict[str, str]] = []
        for state in current_states:
            targets = transitions.get(f"{state},{symbol}", [])
            for target in targets:
                next_states.add(target)
                transition_steps.append(
                    {"source": state, "symbol": symbol, "target": target}
                )

        current_states = sorted(next_states)
        if transition_steps:
            explanation = (
                f"After reading '{symbol}', the NFA can be in "
                f"{{{', '.join(current_states)}}}."
            )
        else:
            explanation = f"No transition is available on '{symbol}'; all paths stop."

        trace.append(
            {
                "step": step,
                "symbol": symbol,
                "current_states": trace[-1]["next_states"],
                "next_states": current_states,
                "transitions": transition_steps,
                "explanation": explanation,
            }
        )

    accepting_states = sorted(set(current_states).intersection(final_states))
    accepted = bool(accepting_states)
    explanation = (
        f"Input completely consumed and an accepting path ends in "
        f"{{{', '.join(accepting_states)}}}."
        if accepted
        else "Input completely consumed, but no active path ends in an accepting state."
    )

    return {
        "accepted": accepted,
        "final_states": current_states,
        "accepting_states": accepting_states,
        "trace": trace,
        "error": None,
        "explanation": explanation,
    }
