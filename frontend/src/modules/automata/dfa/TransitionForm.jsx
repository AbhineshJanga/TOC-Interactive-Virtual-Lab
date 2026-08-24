import React from "react";
function TransitionForm({
  dfa,
  onAddTransition,
  onClose,
}) {
  const [source, setSource] = React.useState(
    dfa.states[0]?.id || ""
  );

  const [symbol, setSymbol] = React.useState(
    dfa.alphabet[0] || ""
  );

  const [target, setTarget] = React.useState(
    dfa.states[0]?.id || ""
  );

  const [error, setError] = React.useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!source || !symbol || !target) {
      setError("Please select all transition fields.");
      return;
    }

    const duplicate = dfa.transitions.some(
      (transition) =>
        transition.source === source &&
        transition.symbol === symbol
    );

    if (duplicate) {
      setError(
        `A transition for (${source}, ${symbol}) already exists.`
      );
      return;
    }

    onAddTransition({
      source,
      target,
      symbol,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Add Transition
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Define a transition for the DFA.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-slate-500 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-5">

          <div>
            <label className="text-sm font-medium text-slate-300">
              From State
            </label>

            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              {dfa.states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">
              Input Symbol
            </label>

            <select
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              {dfa.alphabet.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">
              To State
            </label>

            <select
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              {dfa.states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

        </div>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Add Transition
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransitionForm;