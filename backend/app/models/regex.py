from typing import Any, Dict, List

from pydantic import BaseModel


class RegexRequest(BaseModel):
    regex: str


class RegexResponse(BaseModel):
    regex: str
    postfix: List[str]
    states: List[str]
    alphabet: List[str]
    transitions: Dict[str, List[str]]
    start_state: str
    final_states: List[str]
