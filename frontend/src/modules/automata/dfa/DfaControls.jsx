function DfaControls({ dfa,
    onAddState,
    selectedStateId,
    onDeleteState,
    onOpenTransitionForm, }) {
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
                        {dfa.states.map((state) => state.label).join(", ")}
                    </div>

                    <button
                        onClick={onAddState}
                        className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                        + Add State
                    </button>
                    {selectedStateId && (
                        <button
                            onClick={onDeleteState}
                            className="mt-2 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                        >
                            Delete {selectedStateId}
                        </button>
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

                    <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
                        q0
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300">
                        Final States
                    </label>

                    <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
                        q1
                    </div>
                </div>

                <button
                    onClick={onOpenTransitionForm}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                    + Add Transition
                </button>

            </div>
        </aside>
    );
}

export default DfaControls;