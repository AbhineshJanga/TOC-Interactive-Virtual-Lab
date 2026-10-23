from app.algorithms.epsilon_closure import epsilon_closure
from app.algorithms.epsilon_nfa import simulate_epsilon_nfa, validate_epsilon_nfa


EPSILON_NFA = {
    "states": ["q0", "q1", "q2"],
    "alphabet": ["a", "b"],
    "transitions": {
        "q0,ε": ["q1"],
        "q1,a": ["q1"],
        "q1,b": ["q2"],
    },
    "start_state": "q0",
    "final_states": ["q2"],
}


def test_epsilon_closure_follows_chained_epsilon_edges():
    transitions = {"q0,ε": ["q1"], "q1,ε": ["q2"]}

    assert epsilon_closure(["q0"], transitions) == ["q0", "q1", "q2"]


def test_epsilon_closure_terminates_and_includes_all_states_in_a_cycle():
    transitions = {
        "q0,ε": ["q1"],
        "q1,ε": ["q2"],
        "q2,ε": ["q0"],
    }

    assert epsilon_closure(["q0"], transitions) == ["q0", "q1", "q2"]


def test_validate_epsilon_nfa_accepts_epsilon_transition():
    assert validate_epsilon_nfa(EPSILON_NFA) == {"valid": True, "errors": []}


def test_simulate_epsilon_nfa_accepts_after_closure_and_input_move():
    result = simulate_epsilon_nfa(input_string="b", **EPSILON_NFA)

    assert result["accepted"] is True
    assert result["final_states"] == ["q2"]
    assert result["trace"][0]["next_states"] == ["q0", "q1"]
    assert result["trace"][1]["move_states"] == ["q2"]


def test_simulate_epsilon_nfa_reports_invalid_symbol():
    result = simulate_epsilon_nfa(input_string="c", **EPSILON_NFA)

    assert result["accepted"] is False
    assert "not present in the ε-NFA alphabet" in result["error"]
    assert len(result["trace"]) == 1


def test_simulate_epsilon_nfa_accepts_empty_input_through_epsilon_closure():
    machine = {
        **EPSILON_NFA,
        "transitions": {"q0,ε": ["q1"]},
        "final_states": ["q1"],
    }

    result = simulate_epsilon_nfa(input_string="", **machine)

    assert result["accepted"] is True
    assert result["final_states"] == ["q0", "q1"]
    assert len(result["trace"]) == 1


def test_validate_epsilon_nfa_rejects_multicharacter_alphabet_symbols():
    result = validate_epsilon_nfa({**EPSILON_NFA, "alphabet": ["ab"]})

    assert result["valid"] is False
    assert any("single characters" in error for error in result["errors"])
