from fastapi import APIRouter, HTTPException

from app.algorithms.cfg import derive_cfg, validate_cfg
from app.models.cfg import CFGDerivationRequest


router = APIRouter(prefix="/api/cfg", tags=["CFG"])


@router.post("/validate")
def validate(grammar: dict):
    return validate_cfg(grammar)


@router.post("/derive")
def derive(request: CFGDerivationRequest):
    grammar = request.model_dump()
    validation = validate_cfg(grammar)
    if not validation["valid"]:
        raise HTTPException(status_code=422, detail=validation["errors"])
    return derive_cfg(
        variables=request.variables,
        terminals=request.terminals,
        productions=request.productions,
        start_symbol=request.start_symbol,
        input_string=request.input_string,
        strategy=request.strategy,
        max_steps=request.max_steps,
    )
