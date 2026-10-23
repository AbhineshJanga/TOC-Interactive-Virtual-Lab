import pytest

from app.algorithms.regex_to_nfa import regex_to_nfa, to_postfix


def test_regex_parser_inserts_concatenation_and_respects_precedence():
    assert to_postfix("a(b|c)*") == ["a", "b", "c", "|", "*", "."]


def test_thompson_construction_returns_epsilon_nfa():
    result = regex_to_nfa("a|b")

    assert result["alphabet"] == ["a", "b"]
    assert result["start_state"] in result["states"]
    assert result["final_states"][0] in result["states"]
    assert any(",ε" in key for key in result["transitions"])


def test_regex_concatenation_and_parentheses_preserve_precedence():
    assert to_postfix("ab") == ["a", "b", "."]
    assert to_postfix("(a|b)*c") == ["a", "b", "|", "*", "c", "."]
    assert to_postfix("a|bc*") == ["a", "b", "c", "*", ".", "|"]


def test_thompson_concatenation_contains_linking_epsilon_transition():
    result = regex_to_nfa("ab")

    assert result["alphabet"] == ["a", "b"]
    assert result["postfix"] == ["a", "b", "."]
    assert any(",ε" in key for key in result["transitions"])


def test_regex_rejects_unmatched_parenthesis():
    with pytest.raises(ValueError, match="Unmatched"):
        regex_to_nfa("(ab")


@pytest.mark.parametrize("expression", ["", "a|", "|a", "a||b", "()"])
def test_regex_rejects_empty_or_malformed_expressions(expression):
    with pytest.raises(ValueError):
        regex_to_nfa(expression)
