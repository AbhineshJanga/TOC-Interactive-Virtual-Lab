from fastapi import APIRouter, HTTPException

from app.algorithms.turing_machine import simulate_turing_machine, validate_turing_machine
from app.models.turing_machine import TuringMachineSimulationRequest


router = APIRouter(prefix="/api/turing-machine", tags=["Turing Machine"])


@router.post("/validate")
def validate(machine: dict):
    return validate_turing_machine(machine)


@router.post("/simulate")
def simulate(request: TuringMachineSimulationRequest):
    machine = request.machine
    transitions = [transition.model_dump() for transition in machine.transitions]
    validation = validate_turing_machine(
        {**machine.model_dump(), "transitions": transitions}
    )
    if not validation["valid"]:
        raise HTTPException(status_code=422, detail=validation["errors"])
    return simulate_turing_machine(
        states=machine.states,
        input_alphabet=machine.input_alphabet,
        tape_alphabet=machine.tape_alphabet,
        transitions=transitions,
        start_state=machine.start_state,
        accept_state=machine.accept_state,
        reject_state=machine.reject_state,
        blank_symbol=machine.blank_symbol,
        input_string=request.input_string,
        max_steps=request.max_steps,
    )
