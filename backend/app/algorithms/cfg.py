from collections import deque
from typing import Any


def validate_cfg(grammar: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    variables = grammar.get("variables", [])
    terminals = grammar.get("terminals", [])
    productions = grammar.get("productions", {})
    start_symbol = grammar.get("start_symbol")

    if not isinstance(variables, list) or any(
        not isinstance(symbol, str)
        or not symbol.strip()
        or any(char.isspace() for char in symbol)
        or any(reserved in symbol for reserved in (",", "|", "->", "→"))
        for symbol in variables
    ):
        errors.append("Variables must be non-empty symbols without whitespace or grammar separators.")
        variables = []
    if not isinstance(terminals, list) or any(
        not isinstance(symbol, str)
        or not symbol.strip()
        or any(char.isspace() for char in symbol)
        or any(reserved in symbol for reserved in (",", "|", "->", "→"))
        for symbol in terminals
    ):
        errors.append("Terminals must be non-empty symbols without whitespace or grammar separators.")
        terminals = []
    if not variables:
        errors.append("Grammar must contain at least one variable.")
    if len(variables) != len(set(variables)):
        errors.append("Variables must be unique.")
    if len(terminals) != len(set(terminals)):
        errors.append("Terminals must be unique.")
    if "ε" in variables or "ε" in terminals or "e" in variables or "e" in terminals:
        errors.append("Epsilon notation (ε or e) cannot be declared as a grammar symbol.")
    if set(variables).intersection(terminals):
        errors.append("Variables and terminals must be disjoint.")
    if start_symbol not in variables:
        errors.append(f"Start symbol '{start_symbol}' is not a declared variable.")
    if not isinstance(productions, dict):
        errors.append("Productions must be an object keyed by variable.")
        return {"valid": False, "errors": errors}

    variable_set = set(variables)
    terminal_set = set(terminals)
    declared_variables = set(productions)
    for variable in variable_set - declared_variables:
        errors.append(f"Variable '{variable}' must have at least one production.")
    for variable, alternatives in productions.items():
        if variable not in variable_set:
            errors.append(f"Production left side '{variable}' is not a declared variable.")
        if not isinstance(alternatives, list) or not alternatives:
            errors.append(f"Variable '{variable}' must have at least one production.")
            continue
        for alternative in alternatives:
            if not isinstance(alternative, list):
                errors.append(f"Production {variable} must be a list of symbols.")
                continue
            for symbol in alternative:
                if (
                    not isinstance(symbol, str)
                    or (symbol not in variable_set and symbol not in terminal_set)
                ):
                    errors.append(f"Symbol '{symbol}' in {variable} production is undeclared.")

    return {"valid": not errors, "errors": errors}


def _terminal_prefix_matches(form: tuple[str, ...], target: tuple[str, ...], variables: set[str]) -> bool:
    target_index = 0
    for form_symbol in form:
        if form_symbol in variables:
            return True
        if target_index >= len(target) or form_symbol != target[target_index]:
            return False
        target_index += 1
    return target_index <= len(target)


def _tokenize_input(input_string: str, terminals: list[str]) -> tuple[str, ...] | None:
    ordered_terminals = sorted(terminals, key=len, reverse=True)
    tokens: list[str] = []
    position = 0
    while position < len(input_string):
        terminal = next(
            (
                candidate
                for candidate in ordered_terminals
                if input_string.startswith(candidate, position)
            ),
            None,
        )
        if terminal is None:
            return None
        tokens.append(terminal)
        position += len(terminal)
    return tuple(tokens)


def _parse_tree(start_symbol: str, expansions: list[dict[str, Any]]) -> dict[str, Any]:
    root = {"symbol": start_symbol, "children": []}

    for expansion in expansions:
        node = root
        for index in expansion["path"]:
            node = node["children"][index]
        replacement = expansion["replacement"]
        node["children"] = (
            [{"symbol": symbol, "children": []} for symbol in replacement]
            if replacement
            else [{"symbol": "ε", "children": []}]
        )
    return root


def derive_cfg(
    variables: list[str],
    terminals: list[str],
    productions: dict[str, list[list[str]]],
    start_symbol: str,
    input_string: str,
    strategy: str = "leftmost",
    max_steps: int = 40,
) -> dict[str, Any]:
    """Find a bounded derivation and return its steps plus a parse tree."""
    target = _tokenize_input(input_string, terminals)
    if target is None:
        return {
            "accepted": False,
            "strategy": strategy,
            "derivation": [],
            "expansions": [],
            "parse_tree": None,
            "error": "Input contains a symbol that is not in the grammar's terminals.",
        }
    variable_set = set(variables)
    rightmost = strategy == "rightmost"
    queue = deque([(tuple([start_symbol]), [()], [])])
    visited: set[tuple[str, ...]] = set()

    while queue and len(visited) < 10000:
        form, paths, expansions = queue.popleft()
        if form in visited or len(expansions) > max_steps:
            continue
        visited.add(form)
        if not any(symbol in variable_set for symbol in form):
            if form == target:
                forms: list[list[str]] = [[start_symbol]]
                current = [start_symbol]
                for expansion in expansions:
                    index = expansion["position"]
                    current = current[:index] + expansion["replacement"] + current[index + 1:]
                    forms.append(current[:])
                return {
                    "accepted": True,
                    "strategy": strategy,
                    "derivation": forms,
                    "expansions": expansions,
                    "parse_tree": _parse_tree(start_symbol, expansions),
                    "error": None,
                }
            continue
        variable_indexes = [index for index, symbol in enumerate(form) if symbol in variable_set]
        index = variable_indexes[-1] if rightmost else variable_indexes[0]
        variable = form[index]
        for replacement in productions.get(variable, []):
            next_form = form[:index] + tuple(replacement) + form[index + 1:]
            if _terminal_prefix_matches(next_form, target, variable_set):
                path = paths[index]
                next_paths = (
                    paths[:index]
                    + [path + (child_index,) for child_index in range(len(replacement))]
                    + paths[index + 1:]
                )
                queue.append((
                    next_form,
                    next_paths,
                    expansions + [{
                        "variable": variable,
                        "replacement": replacement,
                        "position": index,
                        "path": list(path),
                    }],
                ))

    return {
        "accepted": False,
        "strategy": strategy,
        "derivation": [],
        "expansions": [],
        "parse_tree": None,
        "error": f"No {strategy} derivation found within {max_steps} steps.",
    }
