import { useState } from "react";
import { Link } from "react-router";
import NfaCanvas from "../nfa/NfaCanvas";
import NfaControls from "../nfa/NfaControls";
import NfaTrace from "../nfa/NfaTrace";
import EpsilonTransitionForm from "./EpsilonTransitionForm";
import { initialEpsilonNfa } from "./epsilonNfaData";
import { simulateEpsilonNfa, validateEpsilonNfa } from "../../../services/api";
import {
  applyAutomatonEdgeChanges,
  applyAutomatonNodeChanges,
  createAutomatonTransitionId,
  toggleAutomatonFinalState,
} from "../shared/automatonGraphChanges";

function EpsilonNfaLab() {
  const [machine, setMachine] = useState(initialEpsilonNfa);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [showTransitionForm, setShowTransitionForm] = useState(false);
  const [inputString, setInputString] = useState("");
  const [result, setResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [requestError, setRequestError] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAddState = () => {
    setResult(null);
    setMachine((current) => {
      const existingIds = new Set(current.states.map((state) => state.id));
      let nextNumber = 0;
      while (existingIds.has(`q${nextNumber}`)) nextNumber += 1;
      return { ...current, states: [...current.states, { id: `q${nextNumber}`, label: `q${nextNumber}`, x: 120 + (nextNumber % 3) * 230, y: 100 + Math.floor(nextNumber / 3) * 170 }] };
    });
  };

  const handleDeleteState = () => {
    if (selectedStateId == null) return;
    setResult(null);
    setMachine((current) => ({ ...current, states: current.states.filter((state) => state.id !== selectedStateId), transitions: current.transitions.filter((transition) => transition.source !== selectedStateId && transition.target !== selectedStateId), finalStates: current.finalStates.filter((state) => state !== selectedStateId), startState: current.startState === selectedStateId ? null : current.startState }));
    setSelectedStateId(null);
  };

  const handleToggleFinal = () => {
    if (selectedStateId == null) return;
    setMachine((current) => toggleAutomatonFinalState(current, selectedStateId));
    setResult(null);
    setRequestError("");
    setValidationErrors([]);
  };

  const handleAddTransition = (transition) => {
    setMachine((current) => ({
      ...current,
      transitions: [
        ...current.transitions,
        { ...transition, id: createAutomatonTransitionId(current.transitions, transition) },
      ],
    }));
    setResult(null);
  };

  const handleDeleteTransition = (transitionId) => {
    setMachine((current) => ({
      ...current,
      transitions: current.transitions.filter((transition) => transition.id !== transitionId),
    }));
    setResult(null);
  };

  const handleEdgesChange = (changes) => {
    setMachine((current) => applyAutomatonEdgeChanges(current, changes));
  };

  const handleNodesChange = (changes) => {
    setMachine((current) => applyAutomatonNodeChanges(current, changes));
  };

  const handleRunSimulation = async (event) => {
    event.preventDefault();
    const epsilonNfa = { states: machine.states.map((state) => state.id), alphabet: machine.alphabet, transitions: machine.transitions.reduce((map, transition) => { const key = `${transition.source},${transition.symbol}`; map[key] = [...(map[key] || []), transition.target]; return map; }, {}), start_state: machine.startState, final_states: machine.finalStates };
    setIsSimulating(true); setRequestError(""); setValidationErrors([]); setResult(null);
    try {
      const validation = await validateEpsilonNfa(epsilonNfa);
      if (!validation.valid) { setValidationErrors(validation.errors || []); return; }
      setResult(await simulateEpsilonNfa(epsilonNfa, inputString));
    } catch (error) { setRequestError(error.message || "Epsilon-NFA simulation failed."); } finally { setIsSimulating(false); }
  };

  const activeStates = result?.trace?.[result.trace.length - 1]?.next_states || [];
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white"><section className="mx-auto max-w-[1600px] px-6 py-8">
      <Link to="/experiment" className="text-sm text-slate-500 hover:text-cyan-400">← Back to Experiment</Link>
      <div className="mt-4"><span className="text-xs uppercase tracking-widest text-cyan-400">ε-NFA Laboratory</span><h1 className="mt-3 text-3xl font-bold">Epsilon-Nondeterministic Finite Automaton</h1><p className="mt-2 text-sm text-slate-400">Follow ε-closure, input moves, and the expanded active state set.</p></div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_280px]"><NfaControls nfa={machine} selectedStateId={selectedStateId} onAddState={handleAddState} onDeleteState={handleDeleteState} onSetStart={() => selectedStateId != null && setMachine((current) => ({ ...current, startState: selectedStateId }))} onToggleFinal={handleToggleFinal} onOpenTransitionForm={() => setShowTransitionForm(true)} /><NfaCanvas nfa={machine} activeStates={activeStates} selectedStateId={selectedStateId} onSelectState={setSelectedStateId} onEdgesChange={handleEdgesChange} onNodesChange={handleNodesChange} onDeleteTransition={handleDeleteTransition} />
        <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Simulation</h2><p className="mt-1 text-sm text-slate-500">The machine applies ε-closure before the first symbol and after every input move.</p><form onSubmit={handleRunSimulation} className="mt-6"><label className="text-sm text-slate-300">Input string<input value={inputString} onChange={(event) => setInputString(event.target.value)} placeholder="e.g. 01" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-600" /></label><button disabled={isSimulating} className="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50">{isSimulating ? "Running..." : "Run simulation"}</button></form>{requestError && <p className="mt-4 text-sm text-red-400">{requestError}</p>}{validationErrors.length > 0 && <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"><p className="font-semibold">Validation errors</p><ul className="mt-2 list-disc space-y-1 pl-4">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}{result && <div className="mt-6 border-t border-slate-800 pt-5"><p className={result.accepted ? "text-xl font-semibold text-emerald-400" : "text-xl font-semibold text-red-400"}>{result.accepted ? "ACCEPTED" : "REJECTED"}</p><p className="mt-2 text-sm text-slate-400">Active states: {result.final_states.join(", ") || "none"}</p><p className="mt-2 text-sm leading-6 text-slate-500">{result.explanation}</p></div>}</aside>
      </div><div className="mt-5"><NfaTrace trace={result?.trace} result={result} /></div>
    </section>{showTransitionForm && <EpsilonTransitionForm machine={machine} onAddTransition={handleAddTransition} onClose={() => setShowTransitionForm(false)} />}</main>
  );
}

export default EpsilonNfaLab;
