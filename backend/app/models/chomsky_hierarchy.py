from typing import Dict, List

from pydantic import BaseModel


class GrammarClassificationRequest(BaseModel):
    variables: List[str]
    terminals: List[str]
    productions: Dict[str, List[List[str]]]
    start_symbol: str
