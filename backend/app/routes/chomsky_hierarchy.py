from fastapi import APIRouter, HTTPException

from app.algorithms.chomsky_hierarchy import classify_grammar
from app.models.chomsky_hierarchy import GrammarClassificationRequest


router = APIRouter(prefix="/api/chomsky-hierarchy", tags=["Chomsky Hierarchy"])


@router.post("/classify")
def classify(request: GrammarClassificationRequest):
    try:
        return classify_grammar(request.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
