import pytest
from fastapi.testclient import TestClient

from app.algorithms.chomsky_hierarchy import classify_grammar
from app.main import app


client = TestClient(app)


def test_classifies_right_linear_grammar_as_type_three():
    result = classify_grammar({
        "variables": ["S", "A"],
        "terminals": ["a", "b"],
        "productions": {"S": [["a", "A"]], "A": [["b"]]},
        "start_symbol": "S",
    })

    assert result["type"] == 3
    assert result["label"] == "Regular Grammar"


def test_classifies_general_single_left_side_grammar_as_type_two():
    result = classify_grammar({
        "variables": ["S"],
        "terminals": ["a", "b"],
        "productions": {"S": [["a", "S", "b"], []]},
        "start_symbol": "S",
    })

    assert result["type"] == 2
    assert result["label"] == "Context-Free Grammar"


def test_classifies_right_linear_grammar_as_type_three():
    result = classify_grammar({
        "variables": ["S", "A"],
        "terminals": ["a", "b"],
        "productions": {"S": [["a", "A"]], "A": [["b"], ["a"]]},
        "start_symbol": "S",
    })

    assert result["type"] == 3


def test_classifies_context_sensitive_non_context_free_grammar_as_type_one():
    result = classify_grammar({
        "variables": ["S"],
        "terminals": ["a"],
        "productions": {"aS": [["S", "a"]], "S": [["a"]]},
        "start_symbol": "S",
    })

    assert result["type"] == 1
    assert result["label"] == "Context-Sensitive Grammar"


def test_classifies_non_context_sensitive_grammar_as_type_zero():
    result = classify_grammar({
        "variables": ["A", "B"],
        "terminals": ["a"],
        "productions": {"AB": [[]]},
        "start_symbol": "A",
    })

    assert result["type"] == 0


@pytest.mark.parametrize(
    "grammar",
    [
        {
            "variables": ["S"],
            "terminals": ["a"],
            "productions": {"S": [["x"]]},
            "start_symbol": "S",
        },
        {
            "variables": ["S"],
            "terminals": ["a"],
            "productions": {"a": [["a"]]},
            "start_symbol": "S",
        },
        {
            "variables": ["S"],
            "terminals": ["S"],
            "productions": {"S": [["S"]]},
            "start_symbol": "S",
        },
    ],
)
def test_rejects_grammars_with_undeclared_or_invalid_symbols(grammar):
    with pytest.raises(ValueError):
        classify_grammar(grammar)


def test_start_epsilon_exception_requires_start_not_to_appear_on_rhs():
    grammar = {
        "variables": ["S"],
        "terminals": ["a", "b"],
        "productions": {"S": [["a", "S", "b"], []]},
        "start_symbol": "S",
    }

    assert classify_grammar(grammar)["type"] == 2


def test_start_epsilon_is_allowed_for_type_three_when_start_is_not_on_rhs():
    result = classify_grammar({
        "variables": ["S"],
        "terminals": [],
        "productions": {"S": [[]]},
        "start_symbol": "S",
    })

    assert result["type"] == 3


def test_classification_api_returns_validation_error_for_undeclared_symbols():
    response = client.post(
        "/api/chomsky-hierarchy/classify",
        json={
            "variables": ["S"],
            "terminals": ["a"],
            "productions": {"S": [["x"]]},
            "start_symbol": "S",
        },
    )

    assert response.status_code == 422
    assert "undeclared" in response.json()["detail"]
