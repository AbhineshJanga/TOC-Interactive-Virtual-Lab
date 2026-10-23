import { useState } from "react";
import { Link } from "react-router";
import NfaCanvas from "./NfaCanvas";
import NfaControls from "./NfaControls";
import NfaTrace from "./NfaTrace";
import TransitionForm from "./TransitionForm";
import { initialNfa } from "./nfaData";
import { simulateNFA, validateNfa } from "../../../services/api";
import {
  applyAutomatonEdgeChanges,
  applyAutomatonNodeChanges,
  createAutomatonTransitionId,
  toggleAutomatonFinalState,
} from "../shared/automatonGraphChanges";

function NfaLab() {
  const [nfa, setNfa] = useState(initialNfa);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [showTransitionForm, setShowTransitionForm] = useState(false);
  const [inputString, setInputString] = useState("");
  const [result, setResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [requestError, setRequestError] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAddState = () => {
    setResult(null);
    setNfa((current) => {
      const existingIds = new Set(current.states.map((state) => state.id));
      let nextNumber = 0;
      while (existingIds.has(`q${nextNumber}`)) nextNumber += 1;
      return { ...current, states: [...current.states, { id: `q${nextNumber}`, label: `q${nextNumber}`, x: 120 + (nextNumber % 3) * 230, y: 100 + Math.floor(nextNumber / 3) * 170 }] };
    });
  };

  const handleDeleteState = () => {
    if (selectedStateId == null) return;
    setResult(null);
    setNfa((current) => ({ ...current, states: current.states.filter((state) => state.id !== selectedStateId), transitions: current.transitions.filter((transition) => transition.source !== selectedStateId && transition.target !== selectedStateId), finalStates: current.finalStates.filter((state) => state !== selectedStateId), startState: current.startState === selectedStateId ? null : current.startState }));
    setSelectedStateId(null);
  };

  const handleToggleFinal = () => {
    if (selectedStateId == null) return;
    setNfa((current) => toggleAutomatonFinalState(current, selectedStateId));
    setResult(null);
    setRequestError("");
    setValidationErrors([]);
  };

  const handleAddTransition = (transition) => {
    setNfa((current) => ({
      ...current,
      transitions: [
        ...current.transitions,
        { ...transition, id: createAutomatonTransitionId(current.transitions, transition) },
      ],
    }));
    setResult(null);
  };

  const handleDeleteTransition = (transitionId) => {
    setNfa((current) => ({
      ...current,
      transitions: current.transitions.filter((transition) => transition.id !== transitionId),
    }));
    setResult(null);
  };

  const handleEdgesChange = (changes) => {
    setNfa((current) => applyAutomatonEdgeChanges(current, changes));
  };

  const handleNodesChange = (changes) => {
    setNfa((current) => applyAutomatonNodeChanges(current, changes));
  };

  const handleRunSimulation = async (event) => {
    event.preventDefault();
    const backendNfa = { states: nfa.states.map((state) => state.id), alphabet: nfa.alphabet, transitions: nfa.transitions.reduce((map, transition) => { const key = `${transition.source},${transition.symbol}`; map[key] = [...(map[key] || []), transition.target]; return map; }, {}), start_state: nfa.startState, final_states: nfa.finalStates };
    setIsSimulating(true); setRequestError(""); setValidationErrors([]); setResult(null);
    try {
      const validation = await validateNfa(backendNfa);
      if (!validation.valid) { setValidationErrors(validation.errors || []); return; }
      setResult(await simulateNFA(backendNfa, inputString));
    } catch (error) { setRequestError(error.message || "NFA simulation failed."); } finally { setIsSimulating(false); }
  };

  const activeStates = result?.trace?.[result.trace.length - 1]?.next_states || [];
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white"><section className="mx-auto max-w-[1600px] px-6 py-8">
      <Link to="/experiment" className="text-sm text-slate-500 hover:text-cyan-400">← Back to Experiment</Link>
      <div className="mt-4"><span className="text-xs uppercase tracking-widest text-cyan-400">NFA Laboratory</span><h1 className="mt-3 text-3xl font-bold">Nondeterministic Finite Automaton</h1><p className="mt-2 text-sm text-slate-400">Build branching computations and observe the complete set of active states.</p></div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_280px]"><NfaControls nfa={nfa} selectedStateId={selectedStateId} onAddState={handleAddState} onDeleteState={handleDeleteState} onSetStart={() => selectedStateId != null && setNfa((current) => ({ ...current, startState: selectedStateId }))} onToggleFinal={handleToggleFinal} onOpenTransitionForm={() => setShowTransitionForm(true)} /><NfaCanvas nfa={nfa} activeStates={activeStates} selectedStateId={selectedStateId} onSelectState={setSelectedStateId} onEdgesChange={handleEdgesChange} onNodesChange={handleNodesChange} onDeleteTransition={handleDeleteTransition} />
        <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Simulation</h2><p className="mt-1 text-sm text-slate-500">An NFA accepts when any active path reaches a final state.</p><form onSubmit={handleRunSimulation} className="mt-6"><label className="text-sm text-slate-300">Input string<input value={inputString} onChange={(event) => setInputString(event.target.value)} placeholder="e.g. 01" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-600" /></label><button disabled={isSimulating} className="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50">{isSimulating ? "Running..." : "Run simulation"}</button></form>{requestError && <p className="mt-4 text-sm text-red-400">{requestError}</p>}{validationErrors.length > 0 && <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"><p className="font-semibold">Validation errors</p><ul className="mt-2 list-disc space-y-1 pl-4">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}{result && <div className="mt-6 border-t border-slate-800 pt-5"><p className={result.accepted ? "text-xl font-semibold text-emerald-400" : "text-xl font-semibold text-red-400"}>{result.accepted ? "ACCEPTED" : "REJECTED"}</p><p className="mt-2 text-sm text-slate-400">Active states: {result.final_states.join(", ") || "none"}</p><p className="mt-2 text-sm leading-6 text-slate-500">{result.explanation}</p></div>}</aside>
      </div><div className="mt-5"><NfaTrace trace={result?.trace} result={result} /></div>
    </section>{showTransitionForm && <TransitionForm nfa={nfa} onAddTransition={handleAddTransition} onClose={() => setShowTransitionForm(false)} />}</main>
  );
}

export default NfaLab;
