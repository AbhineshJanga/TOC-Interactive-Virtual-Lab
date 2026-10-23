from typing import Any, Dict, List

from pydantic import BaseModel, Field


class SubsetConstructionRequest(BaseModel):
    states: List[str]
    alphabet: List[str]
    transitions: Dict[str, List[str]]
    start_state: str
    final_states: List[str]
    use_epsilon_closure: bool = Field(
        False,
        description="Apply ε-closure when converting an ε-NFA.",
    )


class SubsetConstructionResponse(BaseModel):
    dfa: Dict[str, Any]
    subsets: List[Dict[str, Any]]
    steps: List[Dict[str, Any]]
