import pytest
from fastapi.testclient import TestClient

from app.algorithms.dfa_minimization import minimize_dfa
from app.main import app


client = TestClient(app)


DFA = {
    "states": ["a", "b", "c", "dead"],
    "alphabet": ["0", "1"],
    "transitions": {
        "a,0": "b",
        "a,1": "c",
        "b,0": "a",
        "b,1": "c",
        "c,0": "c",
        "c,1": "c",
        "dead,0": "dead",
        "dead,1": "dead",
    },
    "start_state": "a",
    "final_states": ["c"],
}


def test_minimization_removes_unreachable_states():
    result = minimize_dfa(**DFA)

    assert "dead" not in result["reachable_states"]
    assert result["stages"][0]["partitions"] == [["a", "b", "c"]]


def test_minimization_refines_equivalent_states():
    result = minimize_dfa(**DFA)

    assert result["dfa"]["states"] == ["M0", "M1"]
    assert result["dfa"]["final_states"] == ["M0"]
    assert {tuple(item["original_states"]) for item in result["state_mapping"]} == {
        ("a", "b"),
        ("c",),
    }
    assert any(len(stage["partitions"]) == 2 for stage in result["stages"])


@pytest.mark.parametrize(
    ("updates", "expected_error"),
    [
        (
            {"transitions": {key: value for key, value in DFA["transitions"].items() if key != "b,0"}},
            "Missing transition",
        ),
        (
            {"transitions": {**DFA["transitions"], "b,0": "missing"}},
            "unknown state 'missing'",
        ),
        ({"start_state": "missing"}, "Start state 'missing'"),
        ({"final_states": ["missing"]}, "Final state 'missing'"),
        ({"alphabet": ["01"]}, "single characters"),
        (
            {"transitions": {**DFA["transitions"], "ghost,0": "a"}},
            "Transition source 'ghost'",
        ),
    ],
)
def test_minimization_rejects_invalid_machine_before_refinement(updates, expected_error):
    invalid = {**DFA, **updates}

    with pytest.raises(ValueError, match=expected_error):
        minimize_dfa(**invalid)


def test_minimization_api_returns_validation_error_instead_of_traceback():
    invalid = {**DFA, "transitions": {}}

    response = client.post("/api/dfa/minimize", json=invalid)

    assert response.status_code == 422
    assert any("Missing transition" in error for error in response.json()["detail"])


def test_minimization_keeps_valid_complete_dfa_behavior():
    result = minimize_dfa(**DFA)

    assert result["reachable_states"] == ["a", "b", "c"]
    assert len(result["dfa"]["states"]) == 2
    assert all(
        f"{state},{symbol}" in result["dfa"]["transitions"]
        for state in result["dfa"]["states"]
        for symbol in DFA["alphabet"]
    )
