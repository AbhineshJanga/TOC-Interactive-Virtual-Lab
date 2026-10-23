function DfaControls({ dfa,
    onAddState,
    selectedStateId,
    onDeleteState,
    onSetStartState,
    onToggleFinal,
    onOpenTransitionForm,
    onEditTransition,
    onDeleteTransition,
    validationErrors,
}) {
    const selectedState = dfa.states.find((state) => state.id === selectedStateId);
    const isSelectedFinal = selectedStateId != null && dfa.finalStates.includes(selectedStateId);

    return (
        <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-white">
                DFA Builder
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Define the components of your automaton.
            </p>

            <div className="mt-6 space-y-5">

                <div>
                    <label className="text-sm font-medium text-slate-300">
                        States
                    </label>

                    <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
                        {dfa.states.map((state) => state.label).join(", ") || "none"}
                    </div>

                    <button
                        onClick={onAddState}
                        className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                        + Add State
                    </button>
                    {selectedStateId != null && (
                        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                            <p className="text-xs uppercase tracking-wider text-slate-500">Selected state</p>
                            <p className="mt-1 text-sm font-semibold text-white">{selectedState?.label || selectedStateId}</p>
                            <button
                                onClick={() => onSetStartState(selectedStateId)}
                                disabled={dfa.startState === selectedStateId}
                                className="mt-3 w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-default disabled:opacity-50"
                            >
                                {dfa.startState === selectedStateId ? "Current Start State" : "Set as Start State"}
                            </button>
                            <button
                                onClick={() => onToggleFinal(selectedStateId)}
                                className="mt-2 w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                            >
                                {isSelectedFinal ? "Remove Final Status" : "Mark as Final"}
                            </button>
                            <button
                                onClick={onDeleteState}
                                className="mt-2 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                            >
                                Delete {selectedState?.label || selectedStateId}
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300">
                        Alphabet
                    </label>

                    <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
                        0, 1
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300">
                        Start State
                    </label>

                    <select
                        aria-label="DFA start state"
                        value={dfa.startState || ""}
                        onChange={(event) => onSetStartState(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                    >
                        <option value="" disabled>Select a start state</option>
                        {dfa.states.map((state) => (
                            <option key={state.id} value={state.id}>{state.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300">
                        Final States
                    </label>

                    <div className="mt-2 space-y-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                        {dfa.states.map((state) => (
                            <label key={state.id} className="flex items-center gap-2 text-sm text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={dfa.finalStates.includes(state.id)}
                                    onChange={() => onToggleFinal(state.id)}
                                    className="accent-blue-500"
                                />
                                {state.label}
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onOpenTransitionForm}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                    + Add Transition
                </button>

                <div>
                    <h3 className="text-sm font-medium text-slate-300">Transitions</h3>
                    {dfa.transitions.length === 0 ? (
                        <p className="mt-2 text-xs text-slate-500">No transitions defined.</p>
                    ) : (
                        <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
                            {dfa.transitions.map((transition) => (
                                <li
                                    key={transition.id}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2"
                                >
                                    <span className="min-w-0 truncate font-mono text-xs text-slate-300">
                                        δ({transition.source}, {transition.symbol}) = {transition.target}
                                    </span>
                                    <div className="flex shrink-0 gap-1">
                                        <button
                                            type="button"
                                            aria-label={`Edit transition ${transition.source} ${transition.symbol}`}
                                            onClick={() => onEditTransition(transition.id)}
                                            className="rounded px-1.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/10"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={`Delete transition ${transition.source} ${transition.symbol}`}
                                            onClick={() => onDeleteTransition(transition.id)}
                                            className="rounded px-1.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/10"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className={`mt-5 rounded-lg border p-3 ${
                validationErrors.length === 0
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-amber-500/20 bg-amber-500/5"
            }`}>
                <p className={`text-sm font-semibold ${
                    validationErrors.length === 0 ? "text-emerald-300" : "text-amber-300"
                }`}>
                    {validationErrors.length === 0 ? "DFA configuration is complete" : "DFA needs attention"}
                </p>
                {validationErrors.length > 0 && (
                    <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs leading-5 text-amber-200">
                        {validationErrors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export default DfaControls;