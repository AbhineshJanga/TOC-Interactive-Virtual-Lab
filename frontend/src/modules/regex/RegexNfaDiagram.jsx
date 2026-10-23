import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useMemo } from "react";
import "@xyflow/react/dist/style.css";
import AutomatonStateNode from "../automata/shared/AutomatonStateNode";
import AutomatonTransitionEdge from "../automata/shared/AutomatonTransitionEdge";

const nodeTypes = { automatonState: AutomatonStateNode };
const edgeTypes = { automatonTransition: AutomatonTransitionEdge };
const edgeColors = ["#38bdf8", "#f59e0b", "#a78bfa", "#34d399"];
const stateWidth = 88;
const stateHeight = 88;
const horizontalSpacing = 190;
const verticalSpacing = 150;

function getTransitionEdges(result) {
  const edges = [];
  let edgeIndex = 0;

  for (const [key, targets] of Object.entries(result.transitions)) {
    const separator = key.indexOf(",");
    const source = key.slice(0, separator);
    const symbol = key.slice(separator + 1);

    targets.forEach((target) => {
      edges.push({
        id: `transition-${edgeIndex}`,
        source,
        target,
        symbol,
      });
      edgeIndex += 1;
    });
  }

  return edges;
}

function getStateLayers(states, transitions, startState) {
  const stateOrder = new Map(states.map((state, index) => [state, index]));
  const distance = new Map([[startState, 0]]);
  const adjacency = new Map(states.map((state) => [state, []]));

  for (const transition of transitions) {
    adjacency.get(transition.source).push(transition.target);
  }

  const pending = [startState];
  for (let index = 0; index < pending.length; index += 1) {
    const source = pending[index];
    for (const target of adjacency.get(source)) {
      if (distance.has(target)) continue;
      distance.set(target, distance.get(source) + 1);
      pending.push(target);
    }
  }

  let lastReachableLayer = 0;
  for (const layer of distance.values()) {
    lastReachableLayer = Math.max(lastReachableLayer, layer);
  }
  for (const state of states) {
    if (!distance.has(state)) {
      distance.set(state, lastReachableLayer + 1);
    }
  }

  const layers = new Map();
  for (const state of states) {
    const layer = distance.get(state);
    layers.set(layer, [...(layers.get(layer) || []), state]);
  }

  for (const layer of layers.values()) {
    layer.sort((left, right) => stateOrder.get(left) - stateOrder.get(right));
  }
  return layers;
}

function getRouteOffsets(transitions) {
  const groups = new Map();
  for (const transition of transitions) {
    if (transition.source === transition.target) continue;
    const key = JSON.stringify([transition.source, transition.target]);
    groups.set(key, [...(groups.get(key) || []), transition]);
  }

  const offsets = new Map();
  for (const [key, group] of groups) {
    const [source, target] = JSON.parse(key);
    const hasReverse = groups.has(JSON.stringify([target, source]));
    const ordered = [...group].sort((left, right) =>
      left.symbol.localeCompare(right.symbol) || left.id.localeCompare(right.id)
    );
    ordered.forEach((transition, rank) => {
      const offset = hasReverse
        ? 62 + rank * 48
        : ordered.length > 1
          ? (rank - (ordered.length - 1) / 2) * 48
          : 0;
      offsets.set(transition.id, offset);
    });
  }

  return offsets;
}

function createGraph(result) {
  const transitions = getTransitionEdges(result);
  const layers = getStateLayers(result.states, transitions, result.start_state);
  let maxLayerSize = 0;
  for (const layer of layers.values()) {
    maxLayerSize = Math.max(maxLayerSize, layer.length);
  }
  const stateLayers = new Map();
  for (const [rank, statesInLayer] of layers) {
    statesInLayer.forEach((state, index) => {
      stateLayers.set(state, { rank, index, statesInLayer });
    });
  }

  const nodes = result.states.map((state) => {
    const { rank, index, statesInLayer } = stateLayers.get(state);

    return {
      id: state,
      type: "automatonState",
      width: stateWidth,
      height: stateHeight,
      position: {
        x: 100 + rank * horizontalSpacing,
        y:
          100 +
          (maxLayerSize - statesInLayer.length) * (verticalSpacing / 2) +
          index * verticalSpacing,
      },
      data: {
        label: state,
        isStart: state === result.start_state,
        isFinal: result.final_states.includes(state),
      },
      style: {
        width: stateWidth,
        height: stateHeight,
        borderRadius: "50%",
        border: result.final_states.includes(state)
          ? "2px solid #60a5fa"
          : "2px solid #64748b",
        background: "#0f172a",
        color: "#f8fafc",
        fontSize: "15px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    };
  });

  const routeOffsets = getRouteOffsets(transitions);
  const loopRanks = new Map();
  const loopsByState = new Map();
  for (const transition of transitions) {
    if (transition.source !== transition.target) continue;
    loopsByState.set(
      transition.source,
      [...(loopsByState.get(transition.source) || []), transition]
    );
  }
  for (const loops of loopsByState.values()) {
    loops.forEach((transition, index) => loopRanks.set(transition.id, index));
  }

  const nodePositions = new Map(nodes.map((node) => [node.id, node.position]));
  const edges = transitions.map((transition, index) => {
    const sourcePosition = nodePositions.get(transition.source);
    const targetPosition = nodePositions.get(transition.target);
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    const horizontal =
      transition.source === transition.target || Math.abs(dx) >= Math.abs(dy);
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

    return {
      id: transition.id,
      source: transition.source,
      target: transition.target,
      sourceHandle: `source-${sourceSide}`,
      targetHandle: `target-${targetSide}`,
      ariaLabel: `Transition from ${transition.source} on ${transition.symbol} to ${transition.target}`,
      type: "automatonTransition",
      data: {
        label: transition.symbol,
        isSelfLoop: transition.source === transition.target,
        routeOffset: routeOffsets.get(transition.id) || 0,
        loopRank: loopRanks.get(transition.id) || 0,
      },
      style: { stroke: color, strokeWidth: 2.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
        width: 16,
        height: 16,
      },
    };
  });

  return { nodes, edges };
}

function RegexNfaFlow({ result }) {
  const graph = useMemo(() => createGraph(result), [result]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
    let fitFrame;
    const frame = requestAnimationFrame(() => {
      fitFrame = requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 250 });
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (fitFrame != null) cancelAnimationFrame(fitFrame);
    };
  }, [fitView, graph, setEdges, setNodes]);

  return (
    <div className="h-[min(70vh,720px)] min-h-[420px] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        fitView
        onError={(code, message) =>
          console.error(`React Flow error ${code}: ${message}`)
        }
      >
        <Background color="#334155" gap={24} />
        <Controls className="toc-flow-controls" />
        <MiniMap
          className="toc-flow-minimap"
          nodeColor="#1e293b"
          maskColor="rgba(2, 6, 23, 0.7)"
        />
        <Panel position="top-left">
          <button
            type="button"
            className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs font-semibold text-slate-200 shadow-lg transition hover:border-cyan-500 hover:text-cyan-200"
            onClick={() => fitView({ padding: 0.2, duration: 250 })}
          >
            Fit diagram
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

function RegexNfaDiagram({ result }) {
  return (
    <ReactFlowProvider>
      <RegexNfaFlow result={result} />
    </ReactFlowProvider>
  );
}

export default RegexNfaDiagram;
