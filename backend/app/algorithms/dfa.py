def validate_dfa(dfa):
    """
    Validate the structure of a DFA before simulation.
    """

    errors = []

    states = dfa.get("states", [])
    alphabet = dfa.get("alphabet", [])
    start_state = dfa.get("start_state")
    final_states = dfa.get("final_states", [])
    transitions = dfa.get("transitions", {})

    if not isinstance(states, list) or any(not isinstance(state, str) or not state for state in states):
        errors.append("DFA states must be a list of non-empty strings.")
        states = []
    if not isinstance(alphabet, list) or any(not isinstance(symbol, str) for symbol in alphabet):
        errors.append("DFA alphabet must be a list of strings.")
        alphabet = []
    if not isinstance(final_states, list) or any(not isinstance(state, str) for state in final_states):
        errors.append("DFA final states must be a list of state names.")
        final_states = []
    if not isinstance(transitions, dict):
        errors.append("DFA transitions must be an object mapping 'state,symbol' to a destination state.")
        transitions = {}

    # 1. Check states
    if not states:
        errors.append("DFA must contain at least one state.")
    if len(states) != len(set(states)):
        errors.append("DFA states must be unique.")

    # 2. Check alphabet
    if not alphabet:
        errors.append("DFA alphabet cannot be empty.")
    if len(alphabet) != len(set(alphabet)):
        errors.append("DFA alphabet symbols must be unique.")
    if any(not isinstance(symbol, str) or len(symbol) != 1 for symbol in alphabet):
        errors.append("DFA alphabet symbols must be single characters.")

    # 3. Check start state
    if not isinstance(start_state, str):
        errors.append("DFA start state must be a state ID string.")
    elif start_state not in states:
        errors.append(
            f"Start state '{start_state}' is not present in the state set."
        )

    # 4. Check final states
    for state in final_states:
        if state not in states:
            errors.append(
                f"Final state '{state}' is not present in the state set."
            )

    # 5. Check transitions
    # Transitions use the format:
    # "q0,0": "q1"
    # "q0,1": "q0"

    for state in states:
        for symbol in alphabet:
            transition_key = f"{state},{symbol}"
            if transition_key not in transitions:
                errors.append(
                    f"Missing transition: δ({state}, {symbol})."
                )
            else:
                target = transitions[transition_key]
                if not isinstance(target, str):
                    errors.append(
                        f"Transition δ({state}, {symbol}) destination must be a state ID string."
                    )
                elif target not in states:
                    errors.append(
                        f"Transition δ({state}, {symbol}) points to "
                        f"unknown state '{target}'."
                    )

    for transition_key, target in transitions.items():
        if not isinstance(transition_key, str):
            errors.append(f"Invalid transition key '{transition_key}'. Use 'state,symbol'.")
            continue
        source, separator, symbol = transition_key.partition(",")
        if not separator:
            errors.append(
                f"Invalid transition key '{transition_key}'. Use 'state,symbol'."
            )
            continue
        if source not in states:
            errors.append(f"Transition source '{source}' is not present in the state set.")
        if symbol not in alphabet:
            errors.append(f"Transition symbol '{symbol}' is not present in the DFA alphabet.")
        if not isinstance(target, str):
            errors.append("Transition destination must be a state ID string.")
        elif target not in states:
            errors.append(f"Transition target '{target}' is not present in the state set.")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }

def simulate_dfa(
    states,
    alphabet,
    transitions,
    start_state,
    final_states,
    input_string
):
    """
    Simulate a deterministic finite automaton.

    Returns:
        - accepted/rejected result
        - final state
        - step-by-step execution trace
        - error information if the computation cannot continue
    """

    current_state = start_state
    trace = []

    # Initial configuration
    trace.append({
        "step": 0,
        "current_state": current_state,
        "symbol": None,
        "next_state": current_state,
        "explanation": f"Computation starts at state {current_state}."
    })

    # Process the input string symbol by symbol
    for step, symbol in enumerate(input_string, start=1):

        # Check whether the input symbol belongs to the alphabet
        if symbol not in alphabet:
            return {
                "accepted": False,
                "final_state": current_state,
                "trace": trace,
                "error": (
                    f"Symbol '{symbol}' is not present "
                    f"in the DFA alphabet."
                ),
                "explanation": (
                    f"Input rejected because symbol '{symbol}' is not in the DFA alphabet."
                ),
            }

        # DFA transition key
        transition_key = f"{current_state},{symbol}"

        # Check whether the required transition exists
        if transition_key not in transitions:
            return {
                "accepted": False,
                "final_state": current_state,
                "trace": trace,
                "error": (
                    f"No transition exists from state "
                    f"{current_state} on symbol '{symbol}'."
                )
            }

        # Apply the transition
        next_state = transitions[transition_key]

        # Record the computation step
        trace.append({
            "step": step,
            "current_state": current_state,
            "symbol": symbol,
            "next_state": next_state,
            "explanation": (
                f"On input '{symbol}', the DFA moves "
                f"from {current_state} to {next_state}."
            )
        })

        # Move to the next state
        current_state = next_state

    # Check whether the final state is accepting
    accepted = current_state in final_states

    if accepted:
        explanation = (
            f"Input completely consumed and the final state "
            f"{current_state} is an accepting state."
        )
    else:
        explanation = (
            f"Input completely consumed but the final state "
            f"{current_state} is not an accepting state."
        )

    return {
        "accepted": accepted,
        "final_state": current_state,
        "trace": trace,
        "error": None,
        "explanation": explanation
    }