let transitionIdSequence = 0;

export function applyAutomatonEdgeChanges(machine, changes) {
  const removedIds = new Set(
    changes.filter((change) => change.type === "remove").map((change) => change.id)
  );
  const selectedById = new Map(
    changes
      .filter((change) => change.type === "select")
      .map((change) => [change.id, change.selected])
  );

  return {
    ...machine,
    transitions: machine.transitions
      .filter((transition) => !removedIds.has(transition.id))
      .map((transition) =>
        selectedById.has(transition.id)
          ? { ...transition, selected: selectedById.get(transition.id) }
          : transition
      ),
  };
}

export function applyAutomatonNodeChanges(machine, changes) {
  const positions = new Map(
    changes
      .filter((change) => change.type === "position" && change.position)
      .map((change) => [change.id, change.position])
  );
  if (positions.size === 0) return machine;

  return {
    ...machine,
    states: machine.states.map((state) => {
      const position = positions.get(state.id);
      return position ? { ...state, x: position.x, y: position.y } : state;
    }),
  };
}

export function toggleAutomatonFinalState(machine, stateId) {
  const isFinal = machine.finalStates.includes(stateId);
  return {
    ...machine,
    finalStates: isFinal
      ? machine.finalStates.filter((finalStateId) => finalStateId !== stateId)
      : [...machine.finalStates, stateId],
  };
}

export function createAutomatonTransitionId(transitions, { source, symbol, target }) {
  const existingIds = new Set(transitions.map((transition) => transition.id));
  const baseId = `${source}-${symbol}-${target}-${Date.now()}-${transitionIdSequence}`;
  transitionIdSequence += 1;
  let id = baseId;
  let suffix = 1;
  while (existingIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return id;
}
