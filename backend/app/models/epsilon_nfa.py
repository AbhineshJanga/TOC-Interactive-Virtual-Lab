from typing import Dict, List

from pydantic import BaseModel, Field


class EpsilonNFAModel(BaseModel):
    states: List[str] = Field(..., description="List of epsilon-NFA states")
    alphabet: List[str] = Field(..., description="Input alphabet, excluding epsilon")
    transitions: Dict[str, List[str]] = Field(
        ...,
        description="Transitions in the format 'state,symbol': ['next_state']; use ε for epsilon",
    )
    start_state: str
    final_states: List[str]


class EpsilonNFASimulationRequest(BaseModel):
    epsilon_nfa: EpsilonNFAModel
    input_string: str
