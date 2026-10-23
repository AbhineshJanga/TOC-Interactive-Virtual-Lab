import { useState } from "react";

function EpsilonTransitionForm({ machine, onAddTransition, onClose }) {
  const [source, setSource] = useState(machine.states[0]?.id || "");
  const [target, setTarget] = useState(machine.states[0]?.id || "");
  const [symbol, setSymbol] = useState("ε");
  const options = ["ε", ...machine.alphabet];

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddTransition({ source, target, symbol });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-5">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Add ε-NFA transition</h2><button type="button" onClick={onClose} className="text-slate-400 hover:text-white">Close</button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="text-sm text-slate-400">From<select value={source} onChange={(event) => setSource(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white">{machine.states.map((state) => <option key={state.id}>{state.id}</option>)}</select></label>
          <label className="text-sm text-slate-400">Symbol<select value={symbol} onChange={(event) => setSymbol(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className="text-sm text-slate-400">To<select value={target} onChange={(event) => setTarget(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white">{machine.states.map((state) => <option key={state.id}>{state.id}</option>)}</select></label>
        </div>
        <p className="mt-4 text-xs text-slate-500">ε transitions consume no input. Multiple transitions may share a source and label.</p>
        <button className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500">Add transition</button>
      </form>
    </div>
  );
}

export default EpsilonTransitionForm;
