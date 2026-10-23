import AutomatonCanvas from "../shared/AutomatonCanvas";

function DfaCanvas({
    dfa,
    selectedStateId,
    onSelectState,
    onEdgeChanges,
    onNodesChange,
    onDeleteTransition,
    onEditTransition,
}) {
    return (
        <AutomatonCanvas
            machine={dfa}
            selectedStateId={selectedStateId}
            onSelectState={onSelectState}
            onEdgesChange={onEdgeChanges}
            onNodesChange={onNodesChange}
            onDeleteTransition={onDeleteTransition}
            onEditTransition={onEditTransition}
        />
    );
}

export default DfaCanvas;
