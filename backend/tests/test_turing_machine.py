from app.algorithms.turing_machine import simulate_turing_machine, validate_turing_machine


MACHINE = {
    "states": ["q0", "accept", "reject"],
    "input_alphabet": ["1"],
    "tape_alphabet": ["1", "B"],
    "transitions": [
        {"current_state": "q0", "read_symbol": "1", "write_symbol": "1", "move": "R", "next_state": "accept"},
        {"current_state": "q0", "read_symbol": "B", "write_symbol": "B", "move": "R", "next_state": "reject"},
    ],
    "start_state": "q0",
    "accept_state": "accept",
    "reject_state": "reject",
    "blank_symbol": "B",
}

LAST_SYMBOL_ONE_MACHINE = {
    "states": ["q0", "seen_1", "seen_0", "accept", "reject"],
    "input_alphabet": ["0", "1"],
    "tape_alphabet": ["0", "1", "B"],
    "transitions": [
        {"current_state": "q0", "read_symbol": "0", "write_symbol": "0", "move": "R", "next_state": "seen_0"},
        {"current_state": "q0", "read_symbol": "1", "write_symbol": "1", "move": "R", "next_state": "seen_1"},
        {"current_state": "q0", "read_symbol": "B", "write_symbol": "B", "move": "R", "next_state": "reject"},
        {"current_state": "seen_0", "read_symbol": "0", "write_symbol": "0", "move": "R", "next_state": "seen_0"},
        {"current_state": "seen_0", "read_symbol": "1", "write_symbol": "1", "move": "R", "next_state": "seen_1"},
        {"current_state": "seen_0", "read_symbol": "B", "write_symbol": "B", "move": "R", "next_state": "reject"},
        {"current_state": "seen_1", "read_symbol": "0", "write_symbol": "0", "move": "R", "next_state": "seen_0"},
        {"current_state": "seen_1", "read_symbol": "1", "write_symbol": "1", "move": "R", "next_state": "seen_1"},
        {"current_state": "seen_1", "read_symbol": "B", "write_symbol": "B", "move": "R", "next_state": "accept"},
    ],
    "start_state": "q0",
    "accept_state": "accept",
    "reject_state": "reject",
    "blank_symbol": "B",
}


def test_validate_turing_machine_accepts_complete_transition_table():
    assert validate_turing_machine(MACHINE) == {"valid": True, "errors": []}


def test_simulate_turing_machine_writes_moves_and_accepts():
    result = simulate_turing_machine(input_string="1", max_steps=10, **MACHINE)

    assert result["accepted"] is True
    assert result["state"] == "accept"
    assert result["trace"][0]["write_symbol"] == "1"
    assert result["trace"][0]["move"] == "R"
    assert result["trace"][0]["next_state"] == "accept"


def test_simulate_turing_machine_rejects_empty_input():
    result = simulate_turing_machine(input_string="", max_steps=10, **MACHINE)

    assert result["accepted"] is False
    assert result["state"] == "reject"


def test_simulate_turing_machine_scans_input_before_accepting():
    machine = {
        "states": ["q0", "seen_0", "seen_1", "accept", "reject"],
        "input_alphabet": ["0", "1"],
        "tape_alphabet": ["0", "1", "B"],
        "transitions": [
            {"current_state": "q0", "read_symbol": "0", "write_symbol": "0", "move": "R", "next_state": "seen_0"},
            {"current_state": "q0", "read_symbol": "1", "write_symbol": "1", "move": "R", "next_state": "seen_1"},
            {"current_state": "q0", "read_symbol": "B", "write_symbol": "B", "move": "R", "next_state": "reject"},
            {"current_state": "seen_0", "read_symbol": "0", "write_symbol": "0", "move": "R", "next_state": "seen_0"},
            {"current_state": "seen_0", "read_symbol": "1", "write_symbol": "1", "move": "R", "next_state": "seen_1"},
            {"current_state": "seen_0", "read_symbol": "B", "write_symbol": "B", "move": "R", "next_state": "reject"},
            {"current_state": "seen_1", "read_symbol": "0", "write_symbol": "0", "move": "R", "next_state": "seen_0"},
            {"current_state": "seen_1", "read_symbol": "1", "write_symbol": "1", "move": "R", "next_state": "seen_1"},
            {"current_state": "seen_1", "read_symbol": "B", "write_symbol": "B", "move": "R", "next_state": "accept"},
        ],
        "start_state": "q0",
        "accept_state": "accept",
        "reject_state": "reject",
        "blank_symbol": "B",
    }
    result = simulate_turing_machine(input_string="101", max_steps=10, **machine)

    assert result["accepted"] is True
    assert len(result["trace"]) == 4
    assert result["trace"][-1]["read_symbol"] == "B"
    assert result["trace"][-1]["next_state"] == "accept"
    assert [step["head"] for step in result["trace"]] == [0, 1, 2, 3]
    assert any(
        cell["head"] and cell["position"] == 4
        for cell in result["trace"][-1]["tape"]
    )

    rejected = simulate_turing_machine(input_string="100", max_steps=10, **machine)

    assert rejected["accepted"] is False
    assert rejected["trace"][-1]["read_symbol"] == "B"
    assert rejected["trace"][-1]["next_state"] == "reject"


def test_simulate_turing_machine_rejects_input_outside_input_alphabet():
    result = simulate_turing_machine(input_string="0", max_steps=10, **MACHINE)

    assert result["accepted"] is False
    assert result["state"] == "reject"
    assert "outside the machine's input alphabet" in result["explanation"]


def test_simulate_turing_machine_reports_missing_transition():
    result = simulate_turing_machine(input_string="1", max_steps=10, **{**MACHINE, "transitions": []})

    assert result["accepted"] is False
    assert result["halted"] is True
    assert "No transition exists" in result["error"]


def test_simulate_turing_machine_observes_exact_step_limit():
    looping = {
        **MACHINE,
        "transitions": [
            {
                "current_state": "q0",
                "read_symbol": "1",
                "write_symbol": "1",
                "move": "R",
                "next_state": "q0",
            }
        ],
    }

    result = simulate_turing_machine(input_string="1", max_steps=1, **looping)

    assert result["accepted"] is False
    assert result["halted"] is False
    assert "1-step limit" in result["error"]
    assert len(result["trace"]) == 1


def test_default_last_symbol_machine_accepts_and_rejects_expected_inputs():
    for input_string in ("101", "111", "1"):
        result = simulate_turing_machine(
            input_string=input_string, max_steps=100, **LAST_SYMBOL_ONE_MACHINE
        )
        assert result["accepted"] is True
        assert result["state"] == "accept"

    for input_string in ("100", "110", "0"):
        result = simulate_turing_machine(
            input_string=input_string, max_steps=100, **LAST_SYMBOL_ONE_MACHINE
        )
        assert result["accepted"] is False
        assert result["state"] == "reject"


def test_last_symbol_machine_rejects_empty_input():
    result = simulate_turing_machine(
        input_string="", max_steps=100, **LAST_SYMBOL_ONE_MACHINE
    )

    assert result["accepted"] is False
    assert result["state"] == "reject"


def test_validation_rejects_invalid_symbols_and_shared_halt_states():
    invalid = {
        **MACHINE,
        "input_alphabet": ["ab"],
        "accept_state": "reject",
    }

    result = validate_turing_machine(invalid)

    assert result["valid"] is False
    assert any("single characters" in error for error in result["errors"])
    assert any("different" in error for error in result["errors"])


def test_validation_rejects_duplicate_transition_keys():
    invalid = {**MACHINE, "transitions": MACHINE["transitions"] + [MACHINE["transitions"][0]]}

    result = validate_turing_machine(invalid)

    assert result["valid"] is False
    assert any("Duplicate transition" in error for error in result["errors"])
