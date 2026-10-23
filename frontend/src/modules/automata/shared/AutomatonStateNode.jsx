import { useEffect } from "react";
import { Handle, Position, useNodeId, useUpdateNodeInternals } from "@xyflow/react";

const handles = [
  ["left", Position.Left],
  ["right", Position.Right],
  ["top", Position.Top],
  ["bottom", Position.Bottom],
];

function AutomatonStateNode({ data }) {
  const nodeId = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (nodeId) updateNodeInternals(nodeId);
  }, [nodeId, updateNodeInternals]);

  return (
    <>
      {handles.flatMap(([side, position]) => [
        <Handle
          key={`source-${side}`}
          id={`source-${side}`}
          type="source"
          position={position}
          style={{ opacity: 0 }}
        />,
        <Handle
          key={`target-${side}`}
          id={`target-${side}`}
          type="target"
          position={position}
          style={{ opacity: 0 }}
        />,
      ])}
      {data.isFinal && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[7px] rounded-full border border-blue-400"
        />
      )}
      <div className="flex flex-col items-center">
        <span>{data.label}</span>
        {data.isStart && (
          <span className="mt-1 text-[8px] font-medium uppercase tracking-wider text-blue-400">
            START
          </span>
        )}
      </div>
    </>
  );
}

export default AutomatonStateNode;
