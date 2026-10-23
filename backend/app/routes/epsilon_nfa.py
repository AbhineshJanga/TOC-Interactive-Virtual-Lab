from fastapi import APIRouter, HTTPException

from app.algorithms.epsilon_nfa import simulate_epsilon_nfa, validate_epsilon_nfa
from app.models.epsilon_nfa import EpsilonNFASimulationRequest


router = APIRouter(prefix="/api/epsilon-nfa", tags=["ε-NFA"])


@router.post("/validate")
def validate_epsilon_nfa_endpoint(epsilon_nfa: dict):
    return validate_epsilon_nfa(epsilon_nfa)


@router.post("/simulate")
def simulate(request: EpsilonNFASimulationRequest):
    machine = request.epsilon_nfa
    validation = validate_epsilon_nfa(machine.model_dump())
    if not validation["valid"]:
        raise HTTPException(status_code=422, detail=validation["errors"])
    return simulate_epsilon_nfa(
        states=machine.states,
        alphabet=machine.alphabet,
        transitions=machine.transitions,
        start_state=machine.start_state,
        final_states=machine.final_states,
        input_string=request.input_string,
    )
