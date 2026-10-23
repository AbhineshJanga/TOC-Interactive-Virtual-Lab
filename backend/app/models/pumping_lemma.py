from typing import List, Literal

from pydantic import BaseModel, Field, NonNegativeInt


class PumpingLemmaRequest(BaseModel):
    string: str
    pumping_length: int = Field(ge=1)
    x: str
    y: str
    z: str
    language: Literal["anbn", "balanced_parentheses"] = "anbn"
    pump_values: List[NonNegativeInt] = Field(default_factory=lambda: [0, 1, 2, 3])
