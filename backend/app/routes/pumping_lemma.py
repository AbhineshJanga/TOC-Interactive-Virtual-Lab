from fastapi import APIRouter

from app.algorithms.pumping_lemma import analyze_pumping_lemma
from app.models.pumping_lemma import PumpingLemmaRequest


router = APIRouter(prefix="/api/pumping-lemma", tags=["Pumping Lemma"])


@router.post("/analyze")
def analyze(request: PumpingLemmaRequest):
    return analyze_pumping_lemma(**request.model_dump())
