from pydantic import BaseModel, Field
from typing import Dict, List


class DFAModel(BaseModel):
    states: List[str] = Field(..., description="List of DFA states")
    alphabet: List[str] = Field(..., description="Input alphabet")
    transitions: Dict[str, str] = Field(
        ...,
        description="DFA transitions in the format 'state,symbol': 'next_state'"
    )
    start_state: str
    final_states: List[str]


class DFASimulationRequest(BaseModel):
    dfa: DFAModel
    input_string: str