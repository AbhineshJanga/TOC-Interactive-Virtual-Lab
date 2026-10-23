from typing import List

from pydantic import BaseModel, Field


class TMTransition(BaseModel):
    current_state: str
    read_symbol: str
    write_symbol: str
    move: str = Field(pattern="^[LR]$")
    next_state: str


class TuringMachineModel(BaseModel):
    states: List[str]
    input_alphabet: List[str]
    tape_alphabet: List[str]
    transitions: List[TMTransition]
    start_state: str
    accept_state: str
    reject_state: str
    blank_symbol: str = "B"


class TuringMachineSimulationRequest(BaseModel):
    machine: TuringMachineModel
    input_string: str
    max_steps: int = Field(1000, ge=1, le=10000)
