from typing import Dict, List

from pydantic import BaseModel, Field


class NFAModel(BaseModel):
    states: List[str] = Field(..., description="List of NFA states")
    alphabet: List[str] = Field(..., description="Input alphabet")
    transitions: Dict[str, List[str]] = Field(
        ...,
        description="NFA transitions in the format 'state,symbol': ['next_state']",
    )
    start_state: str
    final_states: List[str]


class NFASimulationRequest(BaseModel):
    nfa: NFAModel
    input_string: str
