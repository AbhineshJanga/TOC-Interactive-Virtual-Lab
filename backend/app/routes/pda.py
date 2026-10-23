from fastapi import APIRouter, HTTPException

from app.algorithms.pda import simulate_pda, validate_pda
from app.models.pda import PDASimulationRequest


router = APIRouter(prefix="/api/pda", tags=["PDA"])


@router.post("/validate")
def validate(pda: dict):
    return validate_pda(pda)


@router.post("/simulate")
def simulate(request: PDASimulationRequest):
    pda = request.pda
    transitions = [transition.model_dump() for transition in pda.transitions]
    validation = validate_pda({**pda.model_dump(), "transitions": transitions})
    if not validation["valid"]:
        raise HTTPException(status_code=422, detail=validation["errors"])
    return simulate_pda(
        states=pda.states,
        input_alphabet=pda.input_alphabet,
        stack_alphabet=pda.stack_alphabet,
        transitions=transitions,
        start_state=pda.start_state,
        final_states=pda.final_states,
        initial_stack_symbol=pda.initial_stack_symbol,
        input_string=request.input_string,
        max_steps=request.max_steps,
    )
