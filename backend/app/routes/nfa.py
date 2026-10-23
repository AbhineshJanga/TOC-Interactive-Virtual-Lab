from fastapi import APIRouter, HTTPException

from app.algorithms.nfa import simulate_nfa, validate_nfa
from app.models.nfa import NFASimulationRequest


router = APIRouter(prefix="/api/nfa", tags=["NFA"])


@router.post("/validate")
def validate_nfa_endpoint(nfa: dict):
    return validate_nfa(nfa)


@router.post("/simulate")
def simulate(request: NFASimulationRequest):
    nfa = request.nfa
    validation = validate_nfa(nfa.model_dump())
    if not validation["valid"]:
        raise HTTPException(status_code=422, detail=validation["errors"])
    return simulate_nfa(
        states=nfa.states,
        alphabet=nfa.alphabet,
        transitions=nfa.transitions,
        start_state=nfa.start_state,
        final_states=nfa.final_states,
        input_string=request.input_string,
    )
