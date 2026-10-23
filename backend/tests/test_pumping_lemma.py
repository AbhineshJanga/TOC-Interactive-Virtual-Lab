import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.algorithms.pumping_lemma import analyze_pumping_lemma, belongs_to_language

client = TestClient(app)


def test_anbn_membership():
    assert belongs_to_language("aabb", "anbn") is True
    assert belongs_to_language("aaabbb", "anbn") is True
    assert belongs_to_language("aaab", "anbn") is False
    assert belongs_to_language("aabbb", "anbn") is False
    assert belongs_to_language("bbaa", "anbn") is False


def test_anbn_excludes_empty_string_for_positive_n_convention():
    assert belongs_to_language("", "anbn") is False


def test_balanced_parentheses_rejects_non_parenthesis_symbols():
    assert belongs_to_language("(()())", "balanced_parentheses") is True
    assert belongs_to_language("(x)", "balanced_parentheses") is False
    assert belongs_to_language("())(", "balanced_parentheses") is False


def test_unknown_language_is_rejected():
    with pytest.raises(ValueError, match="Unsupported language"):
        belongs_to_language("anything", "made_up")


def test_valid_decomposition_pumps_string():
    result = analyze_pumping_lemma(
        string="aabb",
        pumping_length=3,
        x="a",
        y="a",
        z="bb",
        language="anbn",
        pump_values=[0, 1, 2, 3],
    )

    assert result["valid_decomposition"] is True
    assert [item["string"] for item in result["pumped"]] == [
        "abb",
        "aabb",
        "aaabb",
        "aaaabb",
    ]
    assert result["pumped"][0]["in_language"] is False


def test_balanced_parentheses_language_is_analyzed_with_valid_decomposition():
    result = analyze_pumping_lemma(
        string="()()",
        pumping_length=2,
        x="",
        y="(",
        z=")()",
        language="balanced_parentheses",
        pump_values=[0, 1, 2],
    )

    assert result["valid_decomposition"] is True
    assert result["pumped"][0]["in_language"] is False
    assert result["pumped"][1]["in_language"] is True
    assert result["pumped"][2]["in_language"] is False


def test_invalid_decomposition_reports_constraints():
    result = analyze_pumping_lemma(
        string="aabb",
        pumping_length=1,
        x="aa",
        y="",
        z="b",
    )

    assert result["valid_decomposition"] is False
    assert any("non-empty" in error for error in result["errors"])
    assert any("xyz" in error for error in result["errors"])
    assert any("|xy|" in error for error in result["errors"])
    assert result["pumped"] == []


def test_decomposition_requires_string_length_at_least_pumping_length():
    result = analyze_pumping_lemma(
        string="ab",
        pumping_length=3,
        x="",
        y="a",
        z="b",
    )

    assert result["valid_decomposition"] is False
    assert result["constraints"]["string_length_valid"] is False
    assert any("length at least" in error for error in result["errors"])


def test_negative_pumping_exponents_are_rejected():
    result = analyze_pumping_lemma(
        string="aabb",
        pumping_length=3,
        x="a",
        y="a",
        z="bb",
        pump_values=[0, -1],
    )

    assert result["valid_decomposition"] is False
    assert result["pumped"] == []
    assert "Pumping exponents must be non-negative integers." in result["errors"]


def test_large_nonnegative_pumping_exponent_is_supported():
    result = analyze_pumping_lemma(
        string="aabb",
        pumping_length=3,
        x="a",
        y="a",
        z="bb",
        pump_values=[10],
    )

    assert result["valid_decomposition"] is True
    assert result["pumped"][0]["i"] == 10
    assert result["pumped"][0]["string"] == "a" * 11 + "bb"


def test_valid_decomposition_reports_original_membership_separately():
    result = analyze_pumping_lemma(
        string="aaabbb",
        pumping_length=4,
        x="aa",
        y="a",
        z="bbb",
        pump_values=[0],
    )

    assert result["valid_decomposition"] is True
    assert result["original_in_language"] is True


def test_api_rejects_unsupported_language():
    response = client.post(
        "/api/pumping-lemma/analyze",
        json={
            "string": "aabb",
            "pumping_length": 3,
            "x": "a",
            "y": "a",
            "z": "bb",
            "language": "made_up",
        },
    )

    assert response.status_code == 422
    assert "anbn" in str(response.json()["detail"])
    assert "balanced_parentheses" in str(response.json()["detail"])


def test_api_rejects_negative_pumping_exponent():
    response = client.post(
        "/api/pumping-lemma/analyze",
        json={
            "string": "aabb",
            "pumping_length": 3,
            "x": "a",
            "y": "a",
            "z": "bb",
            "pump_values": [0, -1],
        },
    )

    assert response.status_code == 422
