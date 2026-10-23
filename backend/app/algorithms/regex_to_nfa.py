from typing import Any


def _is_literal(token: str) -> bool:
    return token not in {"|", ".", "*", "(", ")"}


def tokenize_regex(regex: str) -> list[str]:
    tokens = list(regex.replace(" ", ""))
    if not tokens:
        raise ValueError("Regular expression cannot be empty.")
    with_concat: list[str] = []
    for token in tokens:
        if with_concat and (_is_literal(with_concat[-1]) or with_concat[-1] in {")", "*"}) and (_is_literal(token) or token == "("):
            with_concat.append(".")
        with_concat.append(token)
    return with_concat


def to_postfix(regex: str) -> list[str]:
    tokens = tokenize_regex(regex)
    precedence = {"|": 1, ".": 2, "*": 3}
    output: list[str] = []
    operators: list[str] = []
    expecting_operand = True
    for token in tokens:
        if _is_literal(token):
            if not expecting_operand:
                raise ValueError("Missing operator between regular-expression symbols.")
            output.append(token)
            expecting_operand = False
        elif token == "(":
            if not expecting_operand:
                raise ValueError("Missing operator before opening parenthesis.")
            operators.append(token)
            expecting_operand = True
        elif token == ")":
            if expecting_operand:
                raise ValueError("Parentheses must contain a regular expression.")
            while operators and operators[-1] != "(":
                output.append(operators.pop())
            if not operators:
                raise ValueError("Unmatched closing parenthesis.")
            operators.pop()
            expecting_operand = False
        elif token == "*":
            if expecting_operand:
                raise ValueError("Kleene star must follow an expression.")
            output.append(token)
            expecting_operand = False
        else:
            if expecting_operand:
                raise ValueError(f"Operator '{token}' must follow an expression.")
            while operators and operators[-1] != "(" and precedence[operators[-1]] >= precedence[token]:
                output.append(operators.pop())
            operators.append(token)
            expecting_operand = True
    if expecting_operand:
        raise ValueError("Regular expression cannot end with an operator.")
    while operators:
        operator = operators.pop()
        if operator == "(":
            raise ValueError("Unmatched opening parenthesis.")
        output.append(operator)
    return output


def regex_to_nfa(regex: str) -> dict[str, Any]:
    from app.algorithms.thompson import thompson_from_postfix

    postfix = to_postfix(regex)
    result = thompson_from_postfix(postfix)
    result["regex"] = regex
    result["postfix"] = postfix
    return result
