from typing import Any


def _tokenize_symbols(value: str, symbols: set[str]) -> list[list[str]]:
    """Return valid symbolizations of a concatenated production left side."""
    matches: list[list[str]] = []

    def visit(position: int, tokens: list[str]) -> None:
        if position == len(value):
            matches.append(tokens[:])
            return
        for symbol in sorted(symbols, key=len, reverse=True):
            if value.startswith(symbol, position):
                visit(position + len(symbol), tokens + [symbol])

    visit(0, [])
    return matches


def _grammar_errors(grammar: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    variables = grammar.get("variables")
    terminals = grammar.get("terminals")
    productions = grammar.get("productions")
    start_symbol = grammar.get("start_symbol")

    if not isinstance(variables, list) or not variables:
        errors.append("Grammar must contain at least one variable.")
        variables = []
    if not isinstance(terminals, list):
        errors.append("Terminals must be a list.")
        terminals = []
    if any(not isinstance(symbol, str) or not symbol for symbol in variables + terminals):
        errors.append("Declared variables and terminals must be non-empty strings.")
    if len(variables) != len(set(variables)) or len(terminals) != len(set(terminals)):
        errors.append("Declared variables and terminals must not contain duplicates.")
    if set(variables).intersection(terminals):
        errors.append("Variables and terminals must be disjoint.")
    if start_symbol not in variables:
        errors.append(f"Start symbol '{start_symbol}' is not a declared variable.")
    if not isinstance(productions, dict):
        errors.append("Productions must be an object keyed by left-hand side.")
        return errors

    declared = set(variables).union(terminals)
    for left, alternatives in productions.items():
        if not isinstance(left, str) or not left:
            errors.append("Every production left-hand side must be a non-empty string.")
            continue
        left_tokenizations = _tokenize_symbols(left, declared)
        if not left_tokenizations or not any(
            symbol in variables for tokens in left_tokenizations for symbol in tokens
        ):
            errors.append(
                f"Production left side '{left}' must contain declared symbols and at least one variable."
            )
        if not isinstance(alternatives, list) or not alternatives:
            errors.append(f"Production left side '{left}' must have at least one alternative.")
            continue
        for alternative in alternatives:
            if not isinstance(alternative, list):
                errors.append(f"Production '{left}' alternatives must be lists of symbols.")
                continue
            for symbol in alternative:
                if not isinstance(symbol, str) or symbol not in declared:
                    errors.append(
                        f"Symbol '{symbol}' in production '{left}' is undeclared."
                    )
    return errors


def classify_grammar(grammar: dict[str, Any]) -> dict[str, Any]:
    errors = _grammar_errors(grammar)
    if errors:
        raise ValueError("; ".join(errors))

    variables = set(grammar["variables"])
    terminals = set(grammar["terminals"])
    start_symbol = grammar["start_symbol"]
    productions = grammar["productions"]
    symbols = variables.union(terminals)

    tokenized_productions: list[tuple[list[str], list[list[str]]]] = []
    for left, alternatives in productions.items():
        tokenizations = _tokenize_symbols(left, symbols)
        left_tokens = next(
            (
                tokens
                for tokens in tokenizations
                if any(symbol in variables for symbol in tokens)
            ),
            tokenizations[0],
        )
        tokenized_productions.append((left_tokens, alternatives))

    context_free = all(
        len(left) == 1 and left[0] in variables
        for left, _ in tokenized_productions
    )

    epsilon_allowed = not any(
        start_symbol in replacement
        for _, alternatives in tokenized_productions
        for replacement in alternatives
    )
    context_sensitive = True
    regular_orientations: set[str] = set()
    regular = context_free

    for left, alternatives in tokenized_productions:
        for replacement in alternatives:
            is_start_epsilon = (
                replacement == [] and left == [start_symbol] and epsilon_allowed
            )
            if len(replacement) < len(left) and not is_start_epsilon:
                context_sensitive = False

            if not context_free:
                regular = False
                continue
            if is_start_epsilon:
                continue
            if not replacement:
                regular = False
                continue

            variable_positions = [
                index for index, symbol in enumerate(replacement) if symbol in variables
            ]
            if not variable_positions:
                continue
            if len(variable_positions) != 1:
                regular = False
                continue
            variable_index = variable_positions[0]
            if variable_index == 0 and variable_index == len(replacement) - 1:
                continue
            if variable_index == len(replacement) - 1:
                regular_orientations.add("right")
            elif variable_index == 0:
                regular_orientations.add("left")
            else:
                regular = False

    if len(regular_orientations) > 1:
        regular = False

    if regular:
        type_number, label = 3, "Regular Grammar"
    elif context_free:
        type_number, label = 2, "Context-Free Grammar"
    elif context_sensitive:
        type_number, label = 1, "Context-Sensitive Grammar"
    else:
        type_number, label = 0, "Unrestricted Grammar"

    return {
        "type": type_number,
        "label": label,
        "grammar": grammar,
        "relationships": [
            {"type": 3, "label": "Regular", "machine": "DFA / NFA", "description": "Right-linear productions describe regular languages."},
            {"type": 2, "label": "Context-Free", "machine": "PDA", "description": "One variable on each production left side."},
            {"type": 1, "label": "Context-Sensitive", "machine": "Linear Bounded Automaton", "description": "Productions do not decrease sentential length."},
            {"type": 0, "label": "Unrestricted", "machine": "Turing Machine", "description": "General rewriting rules."},
        ],
        "explanation": f"This grammar is classified as Type {type_number}: {label}.",
    }
