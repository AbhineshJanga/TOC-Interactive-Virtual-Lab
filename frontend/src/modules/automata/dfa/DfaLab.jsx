import { useState } from "react";
import { Link } from "react-router";
import DfaCanvas from "./DfaCanvas";
import DfaControls from "./DfaControls";
import DfaTrace from "./DfaTrace";
import TransitionForm from "./TransitionForm";
import { initialDfa } from "./dfaData";
import { simulateDFA, validateDfa } from "../../../services/api";
function DfaLab() {
    const [dfa, setDfa] = useState(initialDfa);
    const [selectedStateId, setSelectedStateId] = useState(null);
    const [showTransitionForm, setShowTransitionForm] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [inputString, setInputString] = useState("");
    const [simulationResult, setSimulationResult] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationError, setSimulationError] = useState("");

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
    const handleRunSimulation = async () => {
        if (!inputString.trim()) {
            setSimulationError("Please enter an input string.");
            setSimulationResult(null);
            setValidationErrors([]);
            return;
        }

        if (!dfa.startState) {
            setSimulationError("Please define a start state.");
            setSimulationResult(null);
            setValidationErrors([]);
            return;
        }

        if (dfa.finalStates.length === 0) {
            setSimulationError("Please define at least one final state.");
            setSimulationResult(null);
            setValidationErrors([]);
            return;
        }

        setIsSimulating(true);
        setSimulationError("");
        setValidationErrors([]);
        setSimulationResult(null);

        try {
            const backendDfa = {
                states: dfa.states.map((state) => state.id),
                alphabet: dfa.alphabet,
                transitions: dfa.transitions.reduce((result, transition) => {
                    result[`${transition.source},${transition.symbol}`] =
                        transition.target;

                    return result;
                }, {}),
                start_state: dfa.startState,
                final_states: dfa.finalStates,
            };

            // Step 1: Validate DFA
            const validation = await validateDfa(backendDfa);

            if (!validation.valid) {
                setValidationErrors(validation.errors || []);
                setSimulationError("DFA validation failed.");
                return;
            }

            // Step 2: Simulate only if DFA is valid
            const result = await simulateDFA(
                backendDfa,
                inputString.trim()
            );

            setSimulationResult(result);
        } catch (error) {
            console.error("DFA simulation error:", error);

            setSimulationError(
                "Unable to connect to the TOC algorithm engine."
            );
        } finally {
            setIsSimulating(false);
        }
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
                                value={inputString}
                                onChange={(event) => setInputString(event.target.value)}
                                placeholder="e.g. 0101"
                                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={handleRunSimulation}
                            disabled={isSimulating}
                            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSimulating ? "Running..." : "Run Simulation"}
                        </button>

                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Result
                            </p>

                            {simulationError && (
                                <p className="mt-3 text-sm leading-6 text-red-400">
                                    {simulationError}
                                </p>
                            )}
                            {validationErrors.length > 0 && (
                                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                                    <p className="text-sm font-medium text-red-400">
                                        DFA Validation Errors
                                    </p>

                                    <ul className="mt-2 space-y-1 text-sm text-red-300">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!simulationResult && !simulationError && (
                                <>
                                    <p className="mt-2 text-xl font-semibold text-slate-500">
                                        —
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Run the simulation to determine whether the input is
                                        accepted or rejected.
                                    </p>
                                </>
                            )}

                            {simulationResult && (
                                <>
                                    <p
                                        className={`mt-2 text-xl font-semibold ${simulationResult.accepted
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {simulationResult.accepted
                                            ? "ACCEPTED"
                                            : "REJECTED"}
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Final state:{" "}
                                        <span className="font-medium text-white">
                                            {simulationResult.final_state}
                                        </span>
                                    </p>

                                    {simulationResult.explanation && (
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {simulationResult.explanation}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                    </aside>

                </div>

                {/* Trace */}
                <div className="mt-5">
                    <DfaTrace
                        trace={simulationResult?.trace || []}
                        simulationResult={simulationResult}
                    />
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