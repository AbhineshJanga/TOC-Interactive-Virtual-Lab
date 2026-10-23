from typing import List

from pydantic import BaseModel, Field


class PDATransition(BaseModel):
    from_state: str
    input_symbol: str = Field(description="Input symbol or ε")
    stack_top: str
    to_state: str
    push_symbols: List[str] = Field(default_factory=list, description="Symbols listed top-first")


class PDAModel(BaseModel):
    states: List[str]
    input_alphabet: List[str]
    stack_alphabet: List[str]
    transitions: List[PDATransition]
    start_state: str
    final_states: List[str]
    initial_stack_symbol: str


class PDASimulationRequest(BaseModel):
    pda: PDAModel
    input_string: str
    max_steps: int = Field(1000, ge=1, le=10000)
