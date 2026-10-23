function NfaControls({ nfa, selectedStateId, onAddState, onDeleteState, onSetStart, onToggleFinal, onOpenTransitionForm }) {
  const selectedState = nfa.states.find((state) => state.id === selectedStateId);
  const isSelectedFinal = selectedStateId != null && nfa.finalStates.includes(selectedStateId);

  return (
    <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="text-lg font-semibold">Build NFA</h2>
      <p className="mt-1 text-sm text-slate-500">Select a state, then assign its role.</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button onClick={onAddState} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold hover:bg-cyan-500">Add state</button>
        <button onClick={onDeleteState} disabled={selectedStateId == null} className="rounded-lg border border-slate-700 px-3 py-2 text-sm disabled:opacity-40">Delete</button>
      </div>
      <button onClick={onOpenTransitionForm} disabled={nfa.states.length < 1} className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-cyan-400">Add transition</button>
      <div className="mt-6 space-y-2 border-t border-slate-800 pt-5">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Selected state: <span className="font-semibold text-slate-200">{selectedState?.label || selectedStateId || "none"}</span>
        </p>
        <button onClick={onSetStart} disabled={selectedStateId == null} className="w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm disabled:opacity-40">Set selected as start</button>
        <button onClick={onToggleFinal} disabled={selectedStateId == null} className="w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-left text-sm text-blue-200 hover:bg-blue-500/20 disabled:opacity-40">
          {isSelectedFinal ? "Remove Final Status" : "Mark as Final"}
        </button>
      </div>
      <div className="mt-6 text-xs text-slate-500">
        <p>Start: <span className="text-slate-300">{nfa.startState || "unset"}</span></p>
        <p className="mt-2">Final: <span className="text-slate-300">{nfa.finalStates.join(", ") || "none"}</span></p>
      </div>
    </aside>
  );
}

export default NfaControls;
