from fastapi import APIRouter
from app.models.dfa import DFASimulationRequest
from app.algorithms.dfa import simulate_dfa
from app.algorithms.dfa import validate_dfa


router = APIRouter(
    prefix="/api/dfa",
    tags=["DFA"]
)
@router.post("/validate")
def validate_dfa_endpoint(dfa: dict):
    return validate_dfa(dfa)

@router.post("/simulate")
def simulate(request: DFASimulationRequest):
    """
    Simulate a DFA for the given input string.
    """

    dfa = request.dfa

    result = simulate_dfa(
        states=dfa.states,
        alphabet=dfa.alphabet,
        transitions=dfa.transitions,
        start_state=dfa.start_state,
        final_states=dfa.final_states,
        input_string=request.input_string
    )

    return result


