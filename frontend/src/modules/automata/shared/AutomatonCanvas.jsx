import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import "@xyflow/react/dist/style.css";
import AutomatonStateNode from "./AutomatonStateNode";
import AutomatonTransitionEdge from "./AutomatonTransitionEdge";

const nodeTypes = { dfaState: AutomatonStateNode };
const edgeTypes = { dfaTransition: AutomatonTransitionEdge };
const edgeColors = ["#38bdf8", "#f59e0b", "#a78bfa", "#34d399"];

function AutomatonCanvas({
  machine,
  activeStates = [],
  selectedStateId,
  onSelectState,
  onEdgesChange,
  onNodesChange,
  onDeleteTransition,
  onEditTransition,
}) {
  const [selectedTransitionId, setSelectedTransitionId] = useState(null);
  const selectedTransition = machine.transitions.find(
    (transition) => transition.id === selectedTransitionId
  );

  const nodes = machine.states.map((state) => {
    const isStart = state.id === machine.startState;
    const isFinal = machine.finalStates.includes(state.id);
    const isActive = activeStates.includes(state.id);
    const isSelected = state.id === selectedStateId;

    return {
      id: state.id,
      type: "dfaState",
      deletable: false,
      width: 80,
      height: 80,
      position: { x: state.x, y: state.y },
      data: {
        label: state.label,
        isStart,
        isFinal,
        isSelected,
      },
      style: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        border: isFinal ? "2px solid #60a5fa" : "2px solid #64748b",
        background: isActive ? "#075985" : "#0f172a",
        color: "#f8fafc",
        fontSize: "16px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isSelected
          ? "0 0 0 4px rgba(96, 165, 250, 0.35)"
          : isStart
            ? "0 0 0 3px rgba(59, 130, 246, 0.2)"
            : "none",
      },
    };
  });

  const routeGroups = new Map();
  for (const transition of machine.transitions) {
    if (transition.source === transition.target) continue;
    const key = `${transition.source}\u0000${transition.target}`;
    routeGroups.set(key, [...(routeGroups.get(key) || []), transition]);
  }

  const edgeRoutes = new Map();
  for (const [key, group] of routeGroups) {
    const [source, target] = key.split("\u0000");
    const hasReverse = routeGroups.has(`${target}\u0000${source}`);
    const ordered = [...group].sort((left, right) =>
      left.symbol.localeCompare(right.symbol) || left.id.localeCompare(right.id)
    );
    ordered.forEach((transition, rank) => {
      const offset = hasReverse
        ? 62 + rank * 56
        : ordered.length > 1
          ? (rank - (ordered.length - 1) / 2) * 56
          : 0;
      edgeRoutes.set(transition.id, offset);
    });
  }

  const loopGroups = new Map();
  for (const transition of machine.transitions) {
    if (transition.source !== transition.target) continue;
    loopGroups.set(transition.source, [...(loopGroups.get(transition.source) || []), transition]);
  }

  const loopRanks = new Map();
  for (const group of loopGroups.values()) {
    [...group]
      .sort((left, right) =>
        left.symbol.localeCompare(right.symbol) || left.id.localeCompare(right.id)
      )
      .forEach((transition, rank) => loopRanks.set(transition.id, rank));
  }

  const edges = machine.transitions.flatMap((transition, index) => {
    const sourceState = machine.states.find((state) => state.id === transition.source);
    const targetState = machine.states.find((state) => state.id === transition.target);
    if (!sourceState || !targetState) return [];

    const dx = targetState.x - sourceState.x;
    const dy = targetState.y - sourceState.y;
    const horizontal = transition.source === transition.target || Math.abs(dx) >= Math.abs(dy);
    const sourceSide = transition.source === transition.target
      ? "right"
      : horizontal
        ? (dx >= 0 ? "right" : "left")
        : (dy >= 0 ? "bottom" : "top");
    const targetSide = transition.source === transition.target
      ? "top"
      : horizontal
        ? (dx >= 0 ? "left" : "right")
        : (dy >= 0 ? "top" : "bottom");
    const color = edgeColors[index % edgeColors.length];

    return [{
      id: transition.id,
      source: transition.source,
      target: transition.target,
      sourceHandle: `source-${sourceSide}`,
      targetHandle: `target-${targetSide}`,
      ariaLabel: `Transition from ${transition.source} on ${transition.symbol} to ${transition.target}`,
      type: "dfaTransition",
      selected: transition.id === selectedTransitionId,
      data: {
        label: transition.symbol,
        isSelfLoop: transition.source === transition.target,
        routeOffset: edgeRoutes.get(transition.id) || 0,
        loopRank: loopRanks.get(transition.id) || 0,
      },
      style: { stroke: color, strokeWidth: 2.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
        width: 16,
        height: 16,
      },
    }];
  });

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        onError={(code, message) => console.error(`React Flow error ${code}: ${message}`)}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => {
          setSelectedTransitionId(null);
          onSelectState(node.id);
        }}
        onEdgeClick={(_, edge) => {
          setSelectedTransitionId(edge.id);
          onSelectState(null);
        }}
        onPaneClick={() => {
          setSelectedTransitionId(null);
          onSelectState(null);
        }}
      >
        {selectedTransition && (
          <Panel position="top-right">
            <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-xl">
              <div className="text-sm text-slate-200">
                <span className="font-semibold">{selectedTransition.source}</span>
                <span className="mx-1 text-cyan-300">—{selectedTransition.symbol}→</span>
                <span className="font-semibold">{selectedTransition.target}</span>
              </div>
              {onEditTransition && (
                <button
                  type="button"
                  aria-label={`Edit transition ${selectedTransition.source} ${selectedTransition.symbol}`}
                  className="rounded-md border border-blue-500/40 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => onEditTransition(selectedTransition.id)}
                >
                  Edit transition
                </button>
              )}
              <button
                type="button"
                aria-label={`Delete transition ${selectedTransition.source} ${selectedTransition.symbol} ${selectedTransition.target}`}
                className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={() => {
                  onDeleteTransition(selectedTransition.id);
                  setSelectedTransitionId(null);
                }}
              >
                Delete transition
              </button>
            </div>
          </Panel>
        )}
        <Background color="#334155" gap={24} />
        <Controls className="toc-flow-controls" />
        <MiniMap
          className="toc-flow-minimap"
          nodeColor="#1e293b"
          maskColor="rgba(2, 6, 23, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}

export default AutomatonCanvas;
