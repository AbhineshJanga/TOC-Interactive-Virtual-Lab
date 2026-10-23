from fastapi.testclient import TestClient

from app.algorithms.dfa import simulate_dfa, validate_dfa
from app.main import app


client = TestClient(app)


DFA = {
    "states": ["q0", "q1"],
    "alphabet": ["0", "1"],
    "transitions": {
        "q0,0": "q1",
        "q0,1": "q0",
        "q1,0": "q0",
        "q1,1": "q1",
    },
    "start_state": "q0",
    "final_states": ["q1"],
}


def test_validate_dfa_accepts_complete_machine():
    assert validate_dfa(DFA) == {"valid": True, "errors": []}


def test_validate_dfa_accepts_multiple_final_state_ids():
    machine = {**DFA, "final_states": ["q0", "q1"]}

    assert validate_dfa(machine) == {"valid": True, "errors": []}
    assert simulate_dfa(input_string="", **machine)["accepted"] is True


def test_validate_dfa_rejects_invalid_start_and_final_state_references():
    invalid = {**DFA, "start_state": "q9", "final_states": ["q8"]}

    errors = validate_dfa(invalid)["errors"]

    assert "Start state 'q9' is not present in the state set." in errors
    assert "Final state 'q8' is not present in the state set." in errors


def test_validate_dfa_rejects_final_state_objects_with_clear_message():
    result = validate_dfa({**DFA, "final_states": [{"id": "q1"}]})

    assert result["valid"] is False
    assert "DFA final states must be a list of state names." in result["errors"]
    assert all("[object Object]" not in error for error in result["errors"])


def test_validate_dfa_rejects_object_references_without_stringifying_them():
    invalid = {
        **DFA,
        "start_state": {"id": "q0"},
        "transitions": {**DFA["transitions"], "q0,0": {"id": "q1"}},
    }

    errors = validate_dfa(invalid)["errors"]

    assert "DFA start state must be a state ID string." in errors
    assert "Transition δ(q0, 0) destination must be a state ID string." in errors
    assert all("object at" not in error for error in errors)


def test_validate_dfa_reports_missing_transition():
    incomplete = {**DFA, "transitions": {key: value for key, value in DFA["transitions"].items() if key != "q1,1"}}

    result = validate_dfa(incomplete)

    assert result["valid"] is False
    assert "Missing transition: δ(q1, 1)." in result["errors"]


def test_validate_dfa_reports_missing_transitions_from_final_state_regression():
    incomplete = {
        "states": ["q0", "q1", "q2"],
        "alphabet": ["0", "1"],
        "transitions": {
            "q0,0": "q1",
            "q0,1": "q1",
            "q1,0": "q1",
            "q1,1": "q2",
        },
        "start_state": "q0",
        "final_states": ["q2"],
    }

    result = validate_dfa(incomplete)

    assert result["valid"] is False
    assert "Missing transition: δ(q2, 0)." in result["errors"]
    assert "Missing transition: δ(q2, 1)." in result["errors"]
    assert len(result["errors"]) == 2


def test_adding_missing_final_state_transitions_completes_regression_dfa():
    complete = {
        "states": ["q0", "q1", "q2"],
        "alphabet": ["0", "1"],
        "transitions": {
            "q0,0": "q1",
            "q0,1": "q1",
            "q1,0": "q1",
            "q1,1": "q2",
            "q2,0": "q0",
            "q2,1": "q0",
        },
        "start_state": "q0",
        "final_states": ["q2"],
    }

    assert validate_dfa(complete) == {"valid": True, "errors": []}
    result = simulate_dfa(input_string="00001", **complete)
    assert result["accepted"] is True
    assert result["final_state"] == "q2"
    assert [(step["current_state"], step["symbol"], step["next_state"])
            for step in result["trace"][1:]] == [
        ("q0", "0", "q1"),
        ("q1", "0", "q1"),
        ("q1", "0", "q1"),
        ("q1", "0", "q1"),
        ("q1", "1", "q2"),
    ]


def test_validate_dfa_rejects_transition_with_unknown_source_or_symbol():
    invalid = {
        **DFA,
        "transitions": {
            **DFA["transitions"],
            "q9,0": "q0",
            "q0,2": "q1",
        },
    }

    errors = validate_dfa(invalid)["errors"]

    assert "Transition source 'q9' is not present in the state set." in errors
    assert "Transition symbol '2' is not present in the DFA alphabet." in errors


def test_validate_dfa_rejects_transition_with_unknown_destination():
    invalid = {**DFA, "transitions": {**DFA["transitions"], "q0,0": "q9"}}

    errors = validate_dfa(invalid)["errors"]

    assert any("δ(q0, 0) points to unknown state 'q9'" in error for error in errors)
    assert "Transition target 'q9' is not present in the state set." in errors


def test_validate_dfa_rejects_non_mapping_transitions_without_crashing():
    result = validate_dfa({**DFA, "transitions": []})

    assert result["valid"] is False
    assert any("transitions must be an object" in error for error in result["errors"])


def test_simulate_dfa_accepts_and_records_trace():
    result = simulate_dfa(input_string="01", **DFA)

    assert result["accepted"] is True
    assert result["final_state"] == "q1"
    assert len(result["trace"]) == 3
    assert [(step["current_state"], step["symbol"], step["next_state"])
            for step in result["trace"][1:]] == [
        ("q0", "0", "q1"),
        ("q1", "1", "q1"),
    ]


def test_simulate_dfa_rejects_invalid_symbol_without_crashing():
    result = simulate_dfa(input_string="2", **DFA)

    assert result["accepted"] is False
    assert result["final_state"] == "q0"
    assert "not present in the DFA alphabet" in result["error"]
    assert "Input rejected because symbol '2'" in result["explanation"]


def test_simulate_dfa_accepts_empty_input_when_start_is_final():
    result = simulate_dfa(input_string="", **{**DFA, "final_states": ["q0"]})

    assert result["accepted"] is True
    assert result["final_state"] == "q0"


def test_simulate_dfa_rejects_empty_input_when_start_is_not_final():
    result = simulate_dfa(input_string="", **DFA)

    assert result["accepted"] is False
    assert result["final_state"] == "q0"
    assert len(result["trace"]) == 1


def test_validate_dfa_rejects_multicharacter_alphabet_symbols():
    result = validate_dfa({**DFA, "alphabet": ["ab"]})

    assert result["valid"] is False
    assert any("single characters" in error for error in result["errors"])


def test_simulate_dfa_reports_missing_transition_without_raising():
    incomplete = {**DFA, "transitions": {"q0,0": "q1"}}
    result = simulate_dfa(input_string="1", **incomplete)

    assert result["accepted"] is False
    assert "No transition exists" in result["error"]


def test_dfa_simulation_api_accepts_empty_input_at_accepting_start_state():
    response = client.post(
        "/api/dfa/simulate",
        json={"dfa": {**DFA, "final_states": ["q0"]}, "input_string": ""},
    )

    assert response.status_code == 200
    assert response.json()["accepted"] is True


def test_dfa_simulation_api_rejects_empty_input_at_nonaccepting_start_state():
    response = client.post(
        "/api/dfa/simulate",
        json={"dfa": DFA, "input_string": ""},
    )

    assert response.status_code == 200
    assert response.json()["accepted"] is False


def test_dfa_simulation_api_rejects_incomplete_final_state_transitions():
    incomplete = {
        "states": ["q0", "q1", "q2"],
        "alphabet": ["0", "1"],
        "transitions": {
            "q0,0": "q1",
            "q0,1": "q1",
            "q1,0": "q1",
            "q1,1": "q2",
        },
        "start_state": "q0",
        "final_states": ["q2"],
    }

    response = client.post(
        "/api/dfa/simulate",
        json={"dfa": incomplete, "input_string": "00001"},
    )

    assert response.status_code == 422
    assert "Missing transition: δ(q2, 0)." in response.json()["detail"]
    assert "Missing transition: δ(q2, 1)." in response.json()["detail"]


def test_api_allows_vite_requests_from_loopback_address():
    response = client.options(
        "/api/dfa/validate",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
