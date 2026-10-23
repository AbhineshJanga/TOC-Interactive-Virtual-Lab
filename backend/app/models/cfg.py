from typing import Any, Dict, List

from pydantic import BaseModel, Field


class CFGModel(BaseModel):
    variables: List[str]
    terminals: List[str]
    productions: Dict[str, List[List[str]]]
    start_symbol: str


class CFGDerivationRequest(CFGModel):
    input_string: str
    strategy: str = Field("leftmost", pattern="^(leftmost|rightmost)$")
    max_steps: int = Field(40, ge=1, le=200)


class CFGValidationResponse(BaseModel):
    valid: bool
    errors: List[str]


class CFGDerivationResponse(BaseModel):
    accepted: bool
    strategy: str
    derivation: List[List[str]]
    expansions: List[Dict[str, Any]]
    parse_tree: Dict[str, Any] | None
    error: str | None
