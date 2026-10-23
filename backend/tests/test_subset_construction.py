from app.algorithms.subset_construction import subset_construction


NFA = {
    "states": ["q0", "q1", "q2"],
    "alphabet": ["0", "1"],
    "transitions": {
        "q0,0": ["q0", "q1"],
        "q0,1": ["q0"],
        "q1,1": ["q2"],
        "q2,0": ["q2"],
        "q2,1": ["q2"],
    },
    "start_state": "q0",
    "final_states": ["q2"],
}


def test_subset_construction_preserves_branching_derivation():
    result = subset_construction(**NFA)

    assert result["dfa"]["start_state"] == "D0"
    assert {tuple(item["subset"]) for item in result["subsets"]} >= {
        ("q0",),
        ("q0", "q1"),
        ("q0", "q2"),
    }
    first_branch = next(step for step in result["steps"] if step["dfa_state"] == "D0" and step["symbol"] == "0")
    assert first_branch["raw_destination"] == ["q0", "q1"]
    assert first_branch["destination_subset"] == ["q0", "q1"]


def test_subset_construction_marks_subsets_containing_nfa_final_states():
    result = subset_construction(**NFA)

    accepting_names = set(result["dfa"]["final_states"])
    accepting_subsets = {
        item["name"] for item in result["subsets"] if "q2" in item["subset"]
    }
    assert accepting_names == accepting_subsets


def test_subset_construction_applies_epsilon_closure():
    epsilon_nfa = {
        "states": ["q0", "q1", "q2"],
        "alphabet": ["a"],
        "transitions": {"q0,ε": ["q1"], "q1,a": ["q2"]},
        "start_state": "q0",
        "final_states": ["q2"],
        "use_epsilon_closure": True,
    }

    result = subset_construction(**epsilon_nfa)

    assert result["subsets"][0]["subset"] == ["q0", "q1"]
    step = next(step for step in result["steps"] if step["symbol"] == "a")
    assert step["destination_subset"] == ["q2"]
    assert step["destination_dfa_state"] in result["dfa"]["final_states"]
