from typing import Any, Dict, List

from pydantic import BaseModel


class DFAMinimizationRequest(BaseModel):
    states: List[str]
    alphabet: List[str]
    transitions: Dict[str, str]
    start_state: str
    final_states: List[str]


class DFAMinimizationResponse(BaseModel):
    reachable_states: List[str]
    stages: List[Dict[str, Any]]
    state_mapping: List[Dict[str, Any]]
    dfa: Dict[str, Any]
