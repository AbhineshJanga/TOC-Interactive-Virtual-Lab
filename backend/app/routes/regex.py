from fastapi import APIRouter, HTTPException

from app.algorithms.regex_to_nfa import regex_to_nfa
from app.models.regex import RegexRequest


router = APIRouter(prefix="/api/regex", tags=["Regular Expressions"])


@router.post("/to-nfa")
def convert(request: RegexRequest):
    try:
        return regex_to_nfa(request.regex)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
