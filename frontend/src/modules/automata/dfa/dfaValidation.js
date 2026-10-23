export function getDfaValidationErrors(dfa) {
  const errors = [];
  const states = Array.isArray(dfa.states) ? dfa.states : [];
  const alphabet = Array.isArray(dfa.alphabet) ? dfa.alphabet : [];
  const finalStates = Array.isArray(dfa.finalStates) ? dfa.finalStates : [];
  const transitions = Array.isArray(dfa.transitions) ? dfa.transitions : [];
  const stateIds = states
    .filter((state) => state && typeof state.id === "string")
    .map((state) => state.id);

  if (!Array.isArray(dfa.states)) errors.push("DFA states must be a list.");
  if (states.some((state) => !state || typeof state.id !== "string")) {
    errors.push("Each DFA state must have a string state ID.");
  }
  if (!Array.isArray(dfa.alphabet)) errors.push("DFA alphabet must be a list.");
  if (!Array.isArray(dfa.finalStates)) errors.push("DFA final states must be a list of state IDs.");
  if (!Array.isArray(dfa.transitions)) errors.push("DFA transitions must be a list.");

  if (stateIds.length === 0) errors.push("DFA must contain at least one state.");
  if (new Set(stateIds).size !== stateIds.length) errors.push("DFA states must be unique.");
  if (alphabet.length === 0) errors.push("DFA alphabet cannot be empty.");
  if (new Set(alphabet).size !== alphabet.length) {
    errors.push("DFA alphabet symbols must be unique.");
  }
  if (alphabet.some((symbol) => typeof symbol !== "string" || [...symbol].length !== 1)) {
    errors.push("DFA alphabet symbols must be single characters.");
  }
  if (!stateIds.includes(dfa.startState)) {
    errors.push(typeof dfa.startState === "string"
      ? `Start state '${dfa.startState}' is not present in the state set.`
      : "Start state must be a state ID from the state set.");
  }

  for (const finalState of finalStates) {
    if (typeof finalState !== "string") {
      errors.push("Final state references must be state IDs, not state objects.");
      continue;
    }
    if (!stateIds.includes(finalState)) {
      errors.push(`Final state '${finalState}' is not present in the state set.`);
    }
  }

  const transitionsByKey = new Map();
  for (const transition of transitions) {
    if (!transition || typeof transition !== "object") {
      errors.push("Each DFA transition must be a transition object.");
      continue;
    }
    if (
      typeof transition.source !== "string" ||
      typeof transition.target !== "string" ||
      typeof transition.symbol !== "string"
    ) {
      errors.push("Each DFA transition must use string state IDs and an input symbol.");
      continue;
    }
    const key = `${transition.source}\u0000${transition.symbol}`;
    if (transitionsByKey.has(key)) {
      errors.push(`Duplicate transition for state '${transition.source}' and symbol '${transition.symbol}'.`);
    } else {
      transitionsByKey.set(key, transition);
    }
    if (!stateIds.includes(transition.source)) {
      errors.push(`Transition source '${transition.source}' is not present in the state set.`);
    }
    if (!stateIds.includes(transition.target)) {
      errors.push(`Transition target '${transition.target}' is not present in the state set.`);
    }
    if (!alphabet.includes(transition.symbol)) {
      errors.push(`Transition symbol '${transition.symbol}' is not present in the DFA alphabet.`);
    }
  }

  for (const state of stateIds) {
    for (const symbol of alphabet) {
      if (!transitionsByKey.has(`${state}\u0000${symbol}`)) {
        errors.push(`Missing transition: δ(${state}, ${symbol}).`);
      }
    }
  }

  return errors;
}
