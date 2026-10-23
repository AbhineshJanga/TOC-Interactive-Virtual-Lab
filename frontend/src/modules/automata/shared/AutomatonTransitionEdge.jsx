import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react";

function AutomatonTransitionEdge({
  data,
  id,
  markerEnd,
  selected,
  sourceX,
  sourceY,
  style,
  targetX,
  targetY,
}) {
  let path;
  let labelX;
  let labelY;

  if (data.isSelfLoop) {
    const loopWidth = 42 + data.loopRank * 8;
    const loopHeight = 76 + data.loopRank * 28;
    const control1X = sourceX + loopWidth;
    const control1Y = sourceY - loopHeight;
    const control2X = targetX + loopWidth;
    const control2Y = targetY - loopHeight;

    path = `M ${sourceX} ${sourceY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${targetX} ${targetY}`;
    labelX = (sourceX + 3 * control1X + 3 * control2X + targetX) / 8;
    labelY = (sourceY + 3 * control1Y + 3 * control2Y + targetY) / 8;
  } else {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;
    const offset = data.routeOffset || 0;
    const controlX = (sourceX + targetX) / 2 + normalX * offset;
    const controlY = (sourceY + targetY) / 2 + normalY * offset;

    path = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
    labelX = (sourceX + 2 * controlX + targetX) / 4;
    labelY = (sourceY + 2 * controlY + targetY) / 4;
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3.5 : 2.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-slate-700/70 bg-slate-950/95 px-2 py-0.5 text-sm font-semibold text-slate-100 shadow-lg"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default AutomatonTransitionEdge;
