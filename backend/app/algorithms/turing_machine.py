from typing import Any


def validate_turing_machine(machine: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    states = machine.get("states", [])
    input_alphabet = machine.get("input_alphabet", [])
    tape_alphabet = machine.get("tape_alphabet", [])
    transitions = machine.get("transitions", [])
    blank_symbol = machine.get("blank_symbol", "B")

    if not states:
        errors.append("Turing machine must contain at least one state.")
    if len(states) != len(set(states)):
        errors.append("Turing machine states must be unique.")
    if len(input_alphabet) != len(set(input_alphabet)):
        errors.append("Input alphabet symbols must be unique.")
    if len(tape_alphabet) != len(set(tape_alphabet)):
        errors.append("Tape alphabet symbols must be unique.")
    if any(not isinstance(symbol, str) or len(symbol) != 1 for symbol in input_alphabet):
        errors.append("Input alphabet symbols must be single characters.")
    if any(not isinstance(symbol, str) or len(symbol) != 1 for symbol in tape_alphabet):
        errors.append("Tape alphabet symbols must be single characters.")
    for field in ("start_state", "accept_state", "reject_state"):
        if machine.get(field) not in states:
            errors.append(f"{field} '{machine.get(field)}' is not present in the state set.")
    if machine.get("accept_state") == machine.get("reject_state"):
        errors.append("Accept and reject states must be different.")
    if blank_symbol not in tape_alphabet:
        errors.append(f"Blank symbol '{blank_symbol}' must be in the tape alphabet.")
    if any(symbol not in tape_alphabet for symbol in input_alphabet):
        errors.append("Input alphabet must be contained in the tape alphabet.")

    seen: set[tuple[str, str]] = set()
    for index, transition in enumerate(transitions):
        if not isinstance(transition, dict):
            errors.append(f"Transition {index} must be an object.")
            continue
        required = {"current_state", "read_symbol", "write_symbol", "move", "next_state"}
        missing = required.difference(transition)
        if missing:
            errors.append(f"Transition {index} is missing: {', '.join(sorted(missing))}.")
            continue
        key = (transition["current_state"], transition["read_symbol"])
        if key in seen:
            errors.append(f"Duplicate transition for state '{key[0]}' and symbol '{key[1]}'.")
        seen.add(key)
        if transition["current_state"] not in states or transition["next_state"] not in states:
            errors.append(f"Transition {index} references an unknown state.")
        if transition["read_symbol"] not in tape_alphabet or transition["write_symbol"] not in tape_alphabet:
            errors.append(f"Transition {index} uses a symbol outside the tape alphabet.")
        if transition["move"] not in {"L", "R"}:
            errors.append(f"Transition {index} must move L or R.")
    return {"valid": not errors, "errors": errors}


def simulate_turing_machine(
    states: list[str],
    input_alphabet: list[str],
    tape_alphabet: list[str],
    transitions: list[dict[str, Any]],
    start_state: str,
    accept_state: str,
    reject_state: str,
    blank_symbol: str,
    input_string: str,
    max_steps: int = 1000,
) -> dict[str, Any]:
    del states, tape_alphabet
    invalid_symbol = next(
        (symbol for symbol in input_string if symbol not in input_alphabet),
        None,
    )
    if invalid_symbol is not None:
        tape = {index: symbol for index, symbol in enumerate(input_string)}
        if not tape:
            tape[0] = blank_symbol
        return {
            "accepted": False,
            "halted": True,
            "state": reject_state,
            "head": 0,
            "tape": _tape_snapshot(tape, 0, blank_symbol),
            "trace": [],
            "error": f"Input symbol '{invalid_symbol}' is not in the input alphabet.",
            "explanation": "The input contains a symbol outside the machine's input alphabet.",
        }
    tape = {index: symbol for index, symbol in enumerate(input_string)}
    if not tape:
        tape[0] = blank_symbol
    head = 0
    current_state = start_state
    transition_map = {(item["current_state"], item["read_symbol"]): item for item in transitions}
    trace: list[dict[str, Any]] = []

    for step in range(max_steps + 1):
        read_symbol = tape.get(head, blank_symbol)
        if current_state == accept_state or current_state == reject_state:
            accepted = current_state == accept_state
            return {
                "accepted": accepted,
                "halted": True,
                "state": current_state,
                "head": head,
                "tape": _tape_snapshot(tape, head, blank_symbol),
                "trace": trace,
                "error": None,
                "explanation": "The machine halted in its accepting state." if accepted else "The machine halted in its rejecting state.",
            }
        if step == max_steps:
            break
        transition = transition_map.get((current_state, read_symbol))
        if transition is None:
            halted_state = current_state
            current_state = reject_state
            return {
                "accepted": False,
                "halted": True,
                "state": current_state,
                "head": head,
                "tape": _tape_snapshot(tape, head, blank_symbol),
                "trace": trace,
                "error": f"No transition exists from {halted_state} on symbol '{read_symbol}'.",
                "explanation": "The machine stopped because no transition matched the current state and tape symbol.",
            }
        tape[head] = transition["write_symbol"]
        next_head = head + (1 if transition["move"] == "R" else -1)
        trace.append({
            "step": step + 1,
            "state": current_state,
            "head": head,
            "read_symbol": read_symbol,
            "write_symbol": transition["write_symbol"],
            "move": transition["move"],
            "next_state": transition["next_state"],
            "tape": _tape_snapshot(tape, next_head, blank_symbol),
            "explanation": f"Read '{read_symbol}', wrote '{transition['write_symbol']}', moved {transition['move']}, and entered {transition['next_state']}.",
        })
        current_state = transition["next_state"]
        head = next_head

    return {
        "accepted": False,
        "halted": False,
        "state": current_state,
        "head": head,
        "tape": _tape_snapshot(tape, head, blank_symbol),
        "trace": trace,
        "error": f"The machine exceeded the {max_steps}-step limit.",
        "explanation": "Execution stopped before reaching an accepting or rejecting state.",
    }


def _tape_snapshot(tape: dict[int, str], head: int, blank_symbol: str) -> list[dict[str, Any]]:
    left = min(min(tape), head) - 2
    right = max(max(tape), head) + 2
    return [{"position": position, "symbol": tape.get(position, blank_symbol), "head": position == head} for position in range(left, right + 1)]
