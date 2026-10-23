from fastapi import APIRouter, HTTPException

from app.algorithms.dfa_minimization import minimize_dfa, validate_dfa_for_minimization
from app.models.dfa_minimization import DFAMinimizationRequest


router = APIRouter(prefix="/api/dfa/minimize", tags=["DFA Minimization"])


@router.post("")
def minimize(request: DFAMinimizationRequest):
    errors = validate_dfa_for_minimization(
        states=request.states,
        alphabet=request.alphabet,
        transitions=request.transitions,
        start_state=request.start_state,
        final_states=request.final_states,
    )
    if errors:
        raise HTTPException(status_code=422, detail=errors)
    return minimize_dfa(
        states=request.states,
        alphabet=request.alphabet,
        transitions=request.transitions,
        start_state=request.start_state,
        final_states=request.final_states,
    )
