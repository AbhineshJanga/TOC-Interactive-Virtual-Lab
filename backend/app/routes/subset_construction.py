from fastapi import APIRouter

from app.algorithms.subset_construction import subset_construction
from app.models.subset_construction import SubsetConstructionRequest


router = APIRouter(prefix="/api/subset-construction", tags=["Subset Construction"])


@router.post("/convert")
def convert(request: SubsetConstructionRequest):
    return subset_construction(
        states=request.states,
        alphabet=request.alphabet,
        transitions=request.transitions,
        start_state=request.start_state,
        final_states=request.final_states,
        use_epsilon_closure=request.use_epsilon_closure,
    )
