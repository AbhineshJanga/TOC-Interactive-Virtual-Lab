from app.algorithms.nfa import simulate_nfa, validate_nfa


BRANCHING_NFA = {
    "states": ["q0", "q1", "q2"],
    "alphabet": ["0", "1"],
    "transitions": {
        "q0,0": ["q0", "q1"],
        "q0,1": ["q0"],
        "q1,1": ["q2"],
        "q2,0": ["q2"],
        "q2,1": ["q2"],
    },
    "start_state": "q0",
    "final_states": ["q2"],
}


def test_validate_nfa_accepts_branching_transitions():
    result = validate_nfa(BRANCHING_NFA)

    assert result == {"valid": True, "errors": []}


def test_validate_nfa_reports_unknown_target_and_symbol():
    invalid_nfa = {
        **BRANCHING_NFA,
        "transitions": {"q0,2": ["missing"]},
    }

    result = validate_nfa(invalid_nfa)

    assert result["valid"] is False
    assert any("not present in the NFA alphabet" in error for error in result["errors"])
    assert any("unknown state 'missing'" in error for error in result["errors"])


def test_simulate_nfa_accepts_when_one_path_reaches_final_state():
    result = simulate_nfa(input_string="01", **BRANCHING_NFA)

    assert result["accepted"] is True
    assert result["final_states"] == ["q0", "q2"]
    assert result["accepting_states"] == ["q2"]
    assert result["trace"][1]["next_states"] == ["q0", "q1"]


def test_simulate_nfa_rejects_when_no_path_reaches_final_state():
    result = simulate_nfa(input_string="0", **BRANCHING_NFA)

    assert result["accepted"] is False
    assert result["final_states"] == ["q0", "q1"]


def test_simulate_nfa_reports_invalid_symbol_without_crashing():
    result = simulate_nfa(input_string="2", **BRANCHING_NFA)

    assert result["accepted"] is False
    assert "not present in the NFA alphabet" in result["error"]
    assert len(result["trace"]) == 1


def test_simulate_nfa_accepts_empty_input_when_start_is_final():
    result = simulate_nfa(input_string="", **{**BRANCHING_NFA, "final_states": ["q0"]})

    assert result["accepted"] is True
    assert result["final_states"] == ["q0"]
    assert len(result["trace"]) == 1


def test_simulate_nfa_stops_paths_when_a_transition_is_missing():
    result = simulate_nfa(input_string="1", **{**BRANCHING_NFA, "transitions": {}})

    assert result["accepted"] is False
    assert result["final_states"] == []
    assert result["trace"][-1]["next_states"] == []


def test_validate_nfa_rejects_multicharacter_alphabet_symbols():
    result = validate_nfa({**BRANCHING_NFA, "alphabet": ["01"]})

    assert result["valid"] is False
    assert any("single characters" in error for error in result["errors"])
