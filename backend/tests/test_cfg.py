from fastapi.testclient import TestClient

from app.algorithms.cfg import derive_cfg, validate_cfg
from app.main import app
from app.algorithms.parse_tree import count_parse_tree_nodes


client = TestClient(app)


GRAMMAR = {
    "variables": ["S"],
    "terminals": ["a", "b"],
    "productions": {"S": [["a", "S", "b"], []]},
    "start_symbol": "S",
}

USER_GRAMMAR = {
    "variables": ["S", "A", "B"],
    "terminals": ["a", "b"],
    "productions": {
        "S": [["A", "B"]],
        "A": [["a", "A"], ["a"]],
        "B": [["b", "B"], ["b"]],
    },
    "start_symbol": "S",
}


def test_validate_cfg_accepts_epsilon_production():
    assert validate_cfg(GRAMMAR) == {"valid": True, "errors": []}


def test_validate_user_defined_grammar():
    assert validate_cfg(USER_GRAMMAR) == {"valid": True, "errors": []}


def test_leftmost_derivation_builds_parse_tree():
    result = derive_cfg(input_string="aabb", strategy="leftmost", **GRAMMAR)

    assert result["accepted"] is True
    assert result["derivation"][-1] == ["a", "a", "b", "b"]
    assert result["parse_tree"]["symbol"] == "S"
    assert count_parse_tree_nodes(result["parse_tree"]) > 1


def test_user_grammar_leftmost_and_rightmost_derivations():
    leftmost = derive_cfg(
        input_string="aabb", strategy="leftmost", **USER_GRAMMAR
    )
    rightmost = derive_cfg(
        input_string="aabb", strategy="rightmost", **USER_GRAMMAR
    )

    assert leftmost["derivation"] == [
        ["S"],
        ["A", "B"],
        ["a", "A", "B"],
        ["a", "a", "B"],
        ["a", "a", "b", "B"],
        ["a", "a", "b", "b"],
    ]
    assert rightmost["derivation"] == [
        ["S"],
        ["A", "B"],
        ["A", "b", "B"],
        ["A", "b", "b"],
        ["a", "A", "b", "b"],
        ["a", "a", "b", "b"],
    ]
    assert leftmost["parse_tree"] == rightmost["parse_tree"]


def test_invalid_grammar_reports_undeclared_symbol():
    invalid = {**GRAMMAR, "productions": {"S": [["a", "X"]]}}

    result = validate_cfg(invalid)

    assert result["valid"] is False
    assert any("undeclared" in error for error in result["errors"])


def test_invalid_start_symbol_is_reported():
    invalid = {**USER_GRAMMAR, "start_symbol": "X"}

    result = validate_cfg(invalid)

    assert result["valid"] is False
    assert any("Start symbol" in error for error in result["errors"])


def test_invalid_grammar_reports_undeclared_left_side():
    invalid = {
        **USER_GRAMMAR,
        "productions": {**USER_GRAMMAR["productions"], "X": [["a"]]},
    }

    result = validate_cfg(invalid)

    assert result["valid"] is False
    assert any("left side" in error for error in result["errors"])


def test_derivation_rejects_string_outside_grammar():
    result = derive_cfg(input_string="aba", strategy="leftmost", **GRAMMAR)

    assert result["accepted"] is False
    assert result["parse_tree"] is None


def test_derivation_reports_input_symbols_outside_terminal_alphabet():
    result = derive_cfg(input_string="aax", strategy="leftmost", **USER_GRAMMAR)

    assert result["accepted"] is False
    assert "not in the grammar's terminals" in result["error"]
    assert result["parse_tree"] is None


def test_derivation_tokenizes_declared_multicharacter_terminals():
    grammar = {
        "variables": ["S"],
        "terminals": ["id", "+"],
        "productions": {"S": [["id", "+", "id"]]},
        "start_symbol": "S",
    }

    result = derive_cfg(input_string="id+id", strategy="leftmost", **grammar)

    assert result["accepted"] is True
    assert result["derivation"][-1] == ["id", "+", "id"]


def test_rightmost_derivation_expands_rightmost_repeated_variable():
    grammar = {
        "variables": ["S"],
        "terminals": ["a"],
        "productions": {"S": [["S", "S"], ["a"]]},
        "start_symbol": "S",
    }
    result = derive_cfg(input_string="aaa", strategy="rightmost", **grammar)

    assert result["accepted"] is True
    assert result["derivation"] == [
        ["S"],
        ["S", "S"],
        ["S", "S", "S"],
        ["S", "S", "a"],
        ["S", "a", "a"],
        ["a", "a", "a"],
    ]
    assert result["expansions"][1]["position"] == 1
    assert result["expansions"][2]["position"] == 2
    assert all(
        expansion["position"]
        == max(index for index, symbol in enumerate(form) if symbol == "S")
        for form, expansion in zip(result["derivation"], result["expansions"])
    )

    def leaves(node):
        if not node["children"]:
            return [node["symbol"]]
        return [symbol for child in node["children"] for symbol in leaves(child)]

    assert leaves(result["parse_tree"]) == ["a", "a", "a"]


def test_leftmost_derivation_keeps_expanding_first_variable():
    grammar = {
        "variables": ["S"],
        "terminals": ["a"],
        "productions": {"S": [["S", "S"], ["a"]]},
        "start_symbol": "S",
    }
    result = derive_cfg(input_string="aaa", strategy="leftmost", **grammar)

    assert result["accepted"] is True
    assert [form for form in result["derivation"]] == [
        ["S"],
        ["S", "S"],
        ["S", "S", "S"],
        ["a", "S", "S"],
        ["a", "a", "S"],
        ["a", "a", "a"],
    ]
    assert all(expansion["position"] == min(
        index for index, symbol in enumerate(form) if symbol == "S"
    ) for form, expansion in zip(result["derivation"], result["expansions"]))


def test_epsilon_expansion_is_visible_in_parse_tree():
    result = derive_cfg(input_string="", strategy="rightmost", **GRAMMAR)

    assert result["accepted"] is True
    assert result["derivation"] == [["S"], []]
    assert result["parse_tree"]["children"] == [{"symbol": "ε", "children": []}]


def test_cfg_derivation_api_rejects_invalid_grammar():
    response = client.post(
        "/api/cfg/derive",
        json={
            **GRAMMAR,
            "productions": {"S": [["x"]]},
            "input_string": "x",
        },
    )

    assert response.status_code == 422
    assert any("undeclared" in error for error in response.json()["detail"])
