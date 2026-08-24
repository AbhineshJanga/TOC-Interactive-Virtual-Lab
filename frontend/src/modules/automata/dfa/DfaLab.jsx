import { useState } from "react";
import { Link } from "react-router";
import DfaCanvas from "./DfaCanvas";
import DfaControls from "./DfaControls";
import DfaTrace from "./DfaTrace";
import TransitionForm from "./TransitionForm";
import { initialDfa } from "./dfaData";
function DfaLab() {
    const [dfa, setDfa] = useState(initialDfa);
    const [selectedStateId, setSelectedStateId] = useState(null);
    const [showTransitionForm, setShowTransitionForm] = useState(false);

    const handleAddState = () => {

        const existingNumbers = dfa.states
            .map((state) => Number(state.id.replace("q", "")))
            .filter((number) => !Number.isNaN(number));

        const nextNumber =
            existingNumbers.length > 0
                ? Math.max(...existingNumbers) + 1
                : 0;

        const newState = {
            id: `q${nextNumber}`,
            label: `q${nextNumber}`,
            x: 150 + (nextNumber % 3) * 220,
            y: 120 + Math.floor(nextNumber / 3) * 180,
        };

        setDfa((currentDfa) => ({
            ...currentDfa,
            states: [...currentDfa.states, newState],
        }));
    };
    const handleDeleteState = () => {
        if (!selectedStateId) {
            return;
        }

        setDfa((currentDfa) => {
            const stateExists = currentDfa.states.some(
                (state) => state.id === selectedStateId
            );

            if (!stateExists) {
                return currentDfa;
            }

            const remainingStates = currentDfa.states.filter(
                (state) => state.id !== selectedStateId
            );

            const remainingTransitions = currentDfa.transitions.filter(
                (transition) =>
                    transition.source !== selectedStateId &&
                    transition.target !== selectedStateId
            );

            const remainingFinalStates = currentDfa.finalStates.filter(
                (stateId) => stateId !== selectedStateId
            );

            return {
                ...currentDfa,
                states: remainingStates,
                transitions: remainingTransitions,
                finalStates: remainingFinalStates,
                startState:
                    currentDfa.startState === selectedStateId
                        ? null
                        : currentDfa.startState,
            };
        });

        setSelectedStateId(null);
    };
    const handleAddTransition = ({
        source,
        target,
        symbol,
    }) => {
        const transitionId = `${source}-${symbol}-${target}-${Date.now()}`;

        const newTransition = {
            id: transitionId,
            source,
            target,
            symbol,
        };

        setDfa((currentDfa) => ({
            ...currentDfa,
            transitions: [
                ...currentDfa.transitions,
                newTransition,
            ],
        }));
    };
    return (
        <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
            <section className="mx-auto max-w-[1600px] px-6 py-8">

                {/* Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

                    <div>
                        <Link
                            to="/experiment"
                            className="text-sm text-slate-500 transition hover:text-blue-400"
                        >
                            ← Back to Experiment
                        </Link>

                        <div className="mt-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                                <span className="h-2 w-2 rounded-full bg-blue-400" />
                                DFA Laboratory
                            </div>

                            <h1 className="mt-3 text-3xl font-bold">
                                Deterministic Finite Automaton
                            </h1>

                            <p className="mt-2 text-sm text-slate-400">
                                Build a DFA, test an input string, and observe the computation
                                step by step.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                            Status
                        </p>

                        <p className="mt-1 text-sm font-medium text-emerald-400">
                            Ready
                        </p>
                    </div>

                </div>

                {/* Main laboratory */}
                <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_280px]">

                    {/* Builder */}
                    <DfaControls
                        dfa={dfa}
                        onAddState={handleAddState}
                        selectedStateId={selectedStateId}
                        onDeleteState={handleDeleteState}
                        onOpenTransitionForm={() => setShowTransitionForm(true)}
                    />

                    {/* Canvas */}
                    <DfaCanvas
                        dfa={dfa}
                        selectedStateId={selectedStateId}
                        onSelectState={setSelectedStateId}
                    />

                    {/* Simulation */}
                    <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">

                        <h2 className="text-lg font-semibold">
                            Simulation
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Test an input string against the DFA.
                        </p>

                        <div className="mt-6">
                            <label className="text-sm font-medium text-slate-300">
                                Input String
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. 0101"
                                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                            />
                        </div>

                        <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500">
                            Run Simulation
                        </button>

                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Result
                            </p>

                            <p className="mt-2 text-xl font-semibold text-slate-500">
                                —
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Run the simulation to determine whether the input is accepted
                                or rejected.
                            </p>
                        </div>

                    </aside>

                </div>

                {/* Trace */}
                <div className="mt-5">
                    <DfaTrace />
                </div>

            </section>
            {showTransitionForm && (
                <TransitionForm
                    dfa={dfa}
                    onAddTransition={handleAddTransition}
                    onClose={() => setShowTransitionForm(false)}
                />
            )}
        </main>
    );
}

export default DfaLab;