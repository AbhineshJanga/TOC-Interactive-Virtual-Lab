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

    # 1. Check states
    if not states:
        errors.append("DFA must contain at least one state.")

    # 2. Check alphabet
    if not alphabet:
        errors.append("DFA alphabet cannot be empty.")

    # 3. Check start state
    if start_state not in states:
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

                if target not in states:
                    errors.append(
                        f"Transition δ({state}, {symbol}) points to "
                        f"unknown state '{target}'."
                    )

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
                )
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