import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

function DfaCanvas({ dfa,
    selectedStateId,
    onSelectState, }) {
    const nodes = dfa.states.map((state) => {
        const isStart = state.id === dfa.startState;
        const isFinal = dfa.finalStates.includes(state.id);
        const isSelected = state.id === selectedStateId;

        return {
            id: state.id,

            position: {
                x: state.x,
                y: state.y,
            },

            data: {
                label: (
                    <div className="flex flex-col items-center">
                        <span>{state.label}</span>

                        {isStart && (
                            <span className="mt-1 text-[8px] font-medium uppercase tracking-wider text-blue-400">
                                start
                            </span>
                        )}
                    </div>
                ),
            },

            type: "default",

            style: {
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: isFinal
                    ? "3px double #60a5fa"
                    : "2px solid #64748b",
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: "16px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isStart
                    ? "0 0 0 3px rgba(59, 130, 246, 0.2)"
                    : "none",
                boxShadow: isSelected
                    ? "0 0 0 4px rgba(96, 165, 250, 0.35)"
                    : isStart
                        ? "0 0 0 3px rgba(59, 130, 246, 0.2)"
                        : "none",
            },
        };
    });

    const edges = dfa.transitions.map((transition) => ({
        id: transition.id,
        source: transition.source,
        target: transition.target,
        label: transition.symbol,

        style: {
            stroke: "#64748b",
            strokeWidth: 2,
        },

        labelStyle: {
            fill: "#e2e8f0",
            fontWeight: 600,
        },

        labelBgStyle: {
            fill: "#0f172a",
            fillOpacity: 0.9,
        },

        animated: false,
    }));

    return (
        <div className="h-[600px] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                onNodeClick={(_, node) => onSelectState(node.id)}
                onPaneClick={() => onSelectState(null)}
            >
                <Background color="#334155" gap={24} />
                <Controls />
                <MiniMap
                    nodeColor="#1e293b"
                    maskColor="rgba(2, 6, 23, 0.7)"
                />
            </ReactFlow>
        </div>
    );
}

export default DfaCanvas;
