from app.algorithms.pda import simulate_pda, validate_pda


PDA = {
    "states": ["q0", "q1", "accept"],
    "input_alphabet": ["a", "b"],
    "stack_alphabet": ["Z", "A"],
    "transitions": [
        {"from_state": "q0", "input_symbol": "a", "stack_top": "Z", "to_state": "q0", "push_symbols": ["A", "Z"]},
        {"from_state": "q0", "input_symbol": "a", "stack_top": "A", "to_state": "q0", "push_symbols": ["A", "A"]},
        {"from_state": "q0", "input_symbol": "b", "stack_top": "A", "to_state": "q1", "push_symbols": []},
        {"from_state": "q1", "input_symbol": "b", "stack_top": "A", "to_state": "q1", "push_symbols": []},
        {"from_state": "q1", "input_symbol": "ε", "stack_top": "Z", "to_state": "accept", "push_symbols": ["Z"]},
    ],
    "start_state": "q0",
    "final_states": ["accept"],
    "initial_stack_symbol": "Z",
}


def test_validate_pda_accepts_stack_transitions():
    assert validate_pda(PDA) == {"valid": True, "errors": []}


def test_simulate_pda_accepts_balanced_input():
    result = simulate_pda(input_string="ab", max_steps=100, **PDA)

    assert result["accepted"] is True
    assert result["final_state"] == "accept"
    assert result["trace"][0]["stack_after"] == ["A", "Z"]
    assert result["trace"][-1]["stack_after"] == ["Z"]


def test_simulate_pda_rejects_unbalanced_input():
    result = simulate_pda(input_string="a", max_steps=100, **PDA)

    assert result["accepted"] is False
    assert result["error"]


def test_validate_pda_rejects_unknown_stack_symbol():
    invalid = {**PDA, "transitions": [{**PDA["transitions"][0], "stack_top": "X"}]}

    result = validate_pda(invalid)

    assert result["valid"] is False
    assert any("unknown stack-top" in error for error in result["errors"])


def test_validate_pda_rejects_unknown_states_and_input_symbols():
    invalid = {
        **PDA,
        "transitions": [
            {
                **PDA["transitions"][0],
                "from_state": "missing",
                "input_symbol": "x",
            }
        ],
    }

    result = validate_pda(invalid)

    assert result["valid"] is False
    assert any("unknown state" in error for error in result["errors"])
    assert any("outside the input alphabet" in error for error in result["errors"])


def test_simulate_pda_accepts_empty_input_through_epsilon_transition():
    machine = {
        **PDA,
        "transitions": [
            {
                "from_state": "q0",
                "input_symbol": "ε",
                "stack_top": "Z",
                "to_state": "accept",
                "push_symbols": ["Z"],
            }
        ],
    }

    result = simulate_pda(input_string="", max_steps=10, **machine)

    assert result["accepted"] is True
    assert result["trace"][0]["input_symbol"] == "ε"
    assert result["trace"][0]["stack_before"] == ["Z"]
    assert result["trace"][0]["stack_after"] == ["Z"]


def test_simulate_pda_reports_missing_transition_as_rejection():
    machine = {**PDA, "transitions": []}

    result = simulate_pda(input_string="a", max_steps=10, **machine)

    assert result["accepted"] is False
    assert "No accepting PDA computation" in result["error"]


def test_simulate_pda_terminates_at_the_configuration_step_limit():
    machine = {
        **PDA,
        "transitions": [
            {
                "from_state": "q0",
                "input_symbol": "ε",
                "stack_top": "Z",
                "to_state": "q0",
                "push_symbols": ["A", "Z"],
            },
            {
                "from_state": "q0",
                "input_symbol": "ε",
                "stack_top": "A",
                "to_state": "q0",
                "push_symbols": ["A", "A"],
            },
        ],
    }

    result = simulate_pda(input_string="", max_steps=3, **machine)

    assert result["accepted"] is False
    assert "step limit" in result["error"]


def test_pda_a_n_b_n_examples_accept_and_reject():
    for accepted in ("ab", "aabb", "aaabbb"):
        result = simulate_pda(input_string=accepted, max_steps=100, **PDA)
        assert result["accepted"] is True

    for rejected in ("aab", "abb", "abab"):
        result = simulate_pda(input_string=rejected, max_steps=100, **PDA)
        assert result["accepted"] is False


def test_trace_contains_input_and_complete_stack_snapshots():
    result = simulate_pda(input_string="aabb", max_steps=100, **PDA)

    assert result["accepted"] is True
    assert result["trace"][0]["stack_before"] == ["Z"]
    assert result["trace"][0]["stack_after"] == ["A", "Z"]
    assert result["trace"][0]["input_before"] == "aabb"
    assert result["trace"][0]["input_after"] == "abb"
    assert result["stack"] == ["Z"]
    assert result["acceptance_mode"] == "final_state"


def test_final_state_acceptance_uses_configured_accept_state():
    machine = {
        **PDA,
        "final_states": ["q1"],
        "transitions": [
            {
                "from_state": "q0",
                "input_symbol": "a",
                "stack_top": "Z",
                "to_state": "q1",
                "push_symbols": ["Z"],
            }
        ],
    }

    result = simulate_pda(input_string="a", max_steps=10, **machine)

    assert result["accepted"] is True
    assert result["final_state"] == "q1"


def test_validation_rejects_duplicate_states_and_alphabet_symbols():
    invalid = {
        **PDA,
        "states": ["q0", "q0"],
        "input_alphabet": ["a", "a"],
    }

    result = validate_pda(invalid)

    assert result["valid"] is False
    assert any("states must be unique" in error for error in result["errors"])
    assert any("alphabet symbols must be unique" in error for error in result["errors"])


def test_epsilon_pop_operation_can_leave_an_explicitly_empty_stack():
    machine = {
        **PDA,
        "transitions": [
            {
                "from_state": "q0",
                "input_symbol": "ε",
                "stack_top": "Z",
                "to_state": "accept",
                "push_symbols": [],
            }
        ],
    }

    result = simulate_pda(input_string="", max_steps=10, **machine)

    assert result["accepted"] is True
    assert result["stack"] == []
    assert result["trace"][0]["stack_after"] == []


def test_epsilon_only_pda_can_have_an_empty_input_alphabet():
    machine = {
        **PDA,
        "input_alphabet": [],
        "transitions": [
            {
                "from_state": "q0",
                "input_symbol": "ε",
                "stack_top": "Z",
                "to_state": "accept",
                "push_symbols": ["Z"],
            }
        ],
    }

    assert validate_pda(machine) == {"valid": True, "errors": []}
    result = simulate_pda(input_string="", max_steps=10, **machine)
    assert result["accepted"] is True
