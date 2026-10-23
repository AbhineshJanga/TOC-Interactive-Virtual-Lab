import { useState } from "react";

function TransitionForm({ nfa, onAddTransition, onClose }) {
  const [source, setSource] = useState(nfa.states[0]?.id || "");
  const [target, setTarget] = useState(nfa.states[0]?.id || "");
  const [symbol, setSymbol] = useState(nfa.alphabet[0] || "");

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddTransition({ source, target, symbol });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-5">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Add NFA transition</h2><button type="button" onClick={onClose} className="text-slate-400 hover:text-white">Close</button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[['From', source, setSource], ['Symbol', symbol, setSymbol], ['To', target, setTarget]].map(([label, value, setter]) => (
            <label key={label} className="text-sm text-slate-400">{label}
              <select value={value} onChange={(event) => setter(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white">
                {(label === 'Symbol' ? nfa.alphabet : nfa.states.map((state) => state.id)).map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">Multiple transitions with the same source and symbol are allowed.</p>
        <button className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500">Add transition</button>
      </form>
    </div>
  );
}

export default TransitionForm;
