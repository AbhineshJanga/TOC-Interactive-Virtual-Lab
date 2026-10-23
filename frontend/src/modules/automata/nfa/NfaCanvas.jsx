import AutomatonCanvas from "../shared/AutomatonCanvas";

function NfaCanvas({
  nfa,
  activeStates = [],
  selectedStateId,
  onSelectState,
  onEdgesChange,
  onNodesChange,
  onDeleteTransition,
}) {
  return (
    <AutomatonCanvas
      machine={nfa}
      activeStates={activeStates}
      selectedStateId={selectedStateId}
      onSelectState={onSelectState}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      onDeleteTransition={onDeleteTransition}
    />
  );
}

export default NfaCanvas;
