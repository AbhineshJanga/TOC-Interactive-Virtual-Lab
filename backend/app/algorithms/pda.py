from collections import deque
from typing import Any

EPSILON = "ε"


def validate_pda(pda: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    states = pda.get("states", [])
    input_alphabet = pda.get("input_alphabet", [])
    stack_alphabet = pda.get("stack_alphabet", [])
    transitions = pda.get("transitions", [])
    start_state = pda.get("start_state")
    final_states = pda.get("final_states", [])
    initial_stack_symbol = pda.get("initial_stack_symbol")

    for field, value in (
        ("states", states),
        ("input alphabet", input_alphabet),
        ("stack alphabet", stack_alphabet),
        ("final states", final_states),
    ):
        if not isinstance(value, list) or any(
            not isinstance(symbol, str) or not symbol for symbol in value
        ):
            errors.append(f"PDA {field} must be a list of non-empty strings.")
    if not isinstance(states, list) or any(
        not isinstance(state, str) or not state for state in states
    ):
        states = []
    if not isinstance(input_alphabet, list) or any(
        not isinstance(symbol, str) or not symbol for symbol in input_alphabet
    ):
        input_alphabet = []
    if not isinstance(stack_alphabet, list) or any(
        not isinstance(symbol, str) or not symbol for symbol in stack_alphabet
    ):
        stack_alphabet = []
    if not isinstance(final_states, list) or any(
        not isinstance(state, str) or not state for state in final_states
    ):
        final_states = []
    if not isinstance(transitions, list):
        errors.append("PDA transitions must be a list.")
        transitions = []

    if not states:
        errors.append("PDA must contain at least one state.")
    if len(states) != len(set(states)):
        errors.append("PDA states must be unique.")
    if len(input_alphabet) != len(set(input_alphabet)):
        errors.append("PDA input alphabet symbols must be unique.")
    if any(not isinstance(symbol, str) or len(symbol) != 1 for symbol in input_alphabet):
        errors.append("PDA input alphabet symbols must be single characters.")
    if not stack_alphabet:
        errors.append("PDA stack alphabet must contain at least one symbol.")
    if len(stack_alphabet) != len(set(stack_alphabet)):
        errors.append("PDA stack alphabet symbols must be unique.")
    if any(not isinstance(symbol, str) or not symbol for symbol in stack_alphabet):
        errors.append("PDA stack symbols must be non-empty strings.")
    if len(final_states) != len(set(final_states)):
        errors.append("PDA final states must be unique.")
    if start_state not in states:
        errors.append(f"Start state '{start_state}' is not present in the state set.")
    if initial_stack_symbol not in stack_alphabet:
        errors.append(f"Initial stack symbol '{initial_stack_symbol}' is not in the stack alphabet.")
    for state in final_states:
        if state not in states:
            errors.append(f"Final state '{state}' is not present in the state set.")
    for index, transition in enumerate(transitions):
        if not isinstance(transition, dict):
            errors.append(f"Transition {index} must be an object.")
            continue
        required = {"from_state", "input_symbol", "stack_top", "to_state", "push_symbols"}
        missing = required.difference(transition)
        if missing:
            errors.append(f"Transition {index} is missing: {', '.join(sorted(missing))}.")
            continue
        if transition["from_state"] not in states or transition["to_state"] not in states:
            errors.append(f"Transition {index} references an unknown state.")
        if transition["input_symbol"] != EPSILON and transition["input_symbol"] not in input_alphabet:
            errors.append(f"Transition {index} uses input symbol outside the input alphabet.")
        if transition["stack_top"] not in stack_alphabet:
            errors.append(f"Transition {index} uses an unknown stack-top symbol.")
        if not isinstance(transition["push_symbols"], list):
            errors.append(f"Transition {index} replacement must be a list of stack symbols.")
        elif any(symbol not in stack_alphabet for symbol in transition["push_symbols"]):
            errors.append(f"Transition {index} pushes a symbol outside the stack alphabet.")
    return {"valid": not errors, "errors": errors}


def _transition_applies(transition: dict[str, Any], state: str, position: int, input_string: str, stack: tuple[str, ...]) -> bool:
    if transition["from_state"] != state or not stack or transition["stack_top"] != stack[0]:
        return False
    return transition["input_symbol"] == EPSILON or (
        position < len(input_string) and transition["input_symbol"] == input_string[position]
    )


def simulate_pda(
    states: list[str],
    input_alphabet: list[str],
    stack_alphabet: list[str],
    transitions: list[dict[str, Any]],
    start_state: str,
    final_states: list[str],
    initial_stack_symbol: str,
    input_string: str,
    max_steps: int = 1000,
) -> dict[str, Any]:
    """Explore PDA configurations breadth-first and return one accepting path."""
    start_config = (start_state, 0, (initial_stack_symbol,))
    queue = deque([(start_config, [])])
    visited = {start_config}
    explored = 0
    furthest_config = start_config
    furthest_trace: list[dict[str, Any]] = []
    limit_reached = False

    while queue and explored < max_steps:
        (state, position, stack), trace = queue.popleft()
        explored += 1
        if (position, len(trace)) > (furthest_config[1], len(furthest_trace)):
            furthest_config = (state, position, stack)
            furthest_trace = trace
        if position == len(input_string) and state in final_states:
            return {
                "accepted": True,
                "final_state": state,
                "stack": list(stack),
                "input_position": position,
                "acceptance_mode": "final_state",
                "trace": trace,
                "error": None,
                "explanation": "The input was consumed and the PDA reached a configured accepting state.",
            }

        for transition in transitions:
            if not _transition_applies(transition, state, position, input_string, stack):
                continue
            if transition["input_symbol"] != EPSILON and transition["input_symbol"] not in input_alphabet:
                continue
            if any(symbol not in stack_alphabet for symbol in transition["push_symbols"]):
                continue
            consumes = transition["input_symbol"] != EPSILON
            next_position = position + int(consumes)
            next_stack = tuple(transition["push_symbols"] + list(stack[1:]))
            next_config = (transition["to_state"], next_position, next_stack)
            if next_config in visited:
                continue
            visited.add(next_config)
            replacement_display = (
                f"top-first [{', '.join(transition['push_symbols'])}]"
                if transition["push_symbols"]
                else "ε (pop)"
            )
            step = {
                "step": len(trace) + 1,
                "state": state,
                "input_before": input_string[position:],
                "input_position": position,
                "input_symbol": transition["input_symbol"],
                "stack_before": list(stack),
                "stack_top": stack[0],
                "to_state": transition["to_state"],
                "push_symbols": transition["push_symbols"],
                "stack_after": list(next_stack),
                "input_after": input_string[next_position:],
                "next_input_position": next_position,
                "explanation": (
                    f"In {state}, read {transition['input_symbol']}, matched stack top "
                    f"{stack[0]}, moved to {transition['to_state']}, and replaced the top with "
                    f"{replacement_display}."
                ),
            }
            queue.append((next_config, trace + [step]))

    limit_reached = bool(queue)
    final_state, input_position, final_stack = furthest_config
    if limit_reached:
        reason = f"PDA step limit of {max_steps} explored configurations was reached."
        explanation = "The search stopped before finding an accepting computation."
    elif input_position < len(input_string):
        remaining = input_string[input_position:]
        reason = (
            "No accepting PDA computation found: "
            f"no transition can consume the remaining input beginning with '{remaining[0]}'."
        )
        explanation = "The computation stopped with input remaining and no applicable transition."
    else:
        reason = "Input was consumed, but no computation reached an accepting state."
        explanation = "The PDA uses final-state acceptance; the current state is not accepting."
    return {
        "accepted": False,
        "final_state": final_state,
        "input_position": input_position,
        "stack": list(final_stack),
        "acceptance_mode": "final_state",
        "trace": furthest_trace,
        "error": reason,
        "explanation": explanation,
    }
