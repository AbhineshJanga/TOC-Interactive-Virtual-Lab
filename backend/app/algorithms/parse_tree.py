from typing import Any


def count_parse_tree_nodes(tree: dict[str, Any] | None) -> int:
    """Count nodes in the JSON parse-tree representation."""
    if tree is None:
        return 0
    return 1 + sum(count_parse_tree_nodes(child) for child in tree.get("children", []))
