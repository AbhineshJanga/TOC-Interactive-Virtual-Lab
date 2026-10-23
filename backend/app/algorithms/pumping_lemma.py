from typing import Any


SUPPORTED_LANGUAGES = ("anbn", "balanced_parentheses")


def belongs_to_language(value: str, language: str) -> bool:
    if language == "anbn":
        split = len(value) - len(value.lstrip("a"))
        # This lab uses a^n b^n for n >= 1, so epsilon is excluded.
        return bool(value) and value == "a" * split + "b" * split
    if language == "balanced_parentheses":
        if any(symbol not in "()" for symbol in value):
            return False
        depth = 0
        for symbol in value:
            depth += 1 if symbol == "(" else -1 if symbol == ")" else 0
            if depth < 0:
                return False
        return depth == 0
    supported = ", ".join(SUPPORTED_LANGUAGES)
    raise ValueError(f"Unsupported language '{language}'. Supported languages: {supported}.")


def analyze_pumping_lemma(
    string: str,
    pumping_length: int,
    x: str,
    y: str,
    z: str,
    language: str = "anbn",
    pump_values: list[int] | None = None,
) -> dict[str, Any]:
    errors: list[str] = []
    if pump_values is None:
        pump_values = [0, 1, 2, 3]
    if pumping_length < 1:
        errors.append("Pumping length must be at least 1.")
    if len(string) < pumping_length:
        errors.append("The string must have length at least the pumping length p.")
    if x + y + z != string:
        errors.append("The decomposition must satisfy s = xyz.")
    if len(x + y) > pumping_length:
        errors.append("The decomposition must satisfy |xy| ≤ p.")
    if not y:
        errors.append("The pumped segment y must be non-empty.")
    if any(value < 0 for value in pump_values):
        errors.append("Pumping exponents must be non-negative integers.")

    valid = not errors
    pumped = [
        {
            "i": value,
            "string": x + y * value + z,
            "in_language": belongs_to_language(x + y * value + z, language),
        }
        for value in pump_values
        if valid
    ]
    return {
        "valid_decomposition": valid,
        "errors": errors,
        "string": string,
        "original_in_language": belongs_to_language(string, language),
        "pumping_length": pumping_length,
        "decomposition": {"x": x, "y": y, "z": z},
        "constraints": {
            "string_length": len(string),
            "string_length_valid": len(string) >= pumping_length,
            "xy_length": len(x + y),
            "xy_length_valid": len(x + y) <= pumping_length,
            "y_length": len(y),
            "y_nonempty": bool(y),
            "reconstructs_string": x + y + z == string,
        },
        "pumped": pumped,
        "explanation": (
            f"The decomposition satisfies |s| = {len(string)} ≥ p = {pumping_length}, s = xyz, |xy| = {len(x + y)} ≤ {pumping_length}, and |y| = {len(y)} > 0."
            if valid
            else "The decomposition violates one or more pumping-lemma constraints."
        ),
    }
