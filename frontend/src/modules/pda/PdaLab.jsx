import { useState } from "react";
import { Link } from "react-router";
import { simulatePda, validatePda } from "../../services/api";

const EPSILON = "ε";
let transitionId = 0;

const initialPda = {
  states: ["q0", "q1", "accept"],
  input_alphabet: ["a", "b"],
  stack_alphabet: ["Z", "A"],
  transitions: [
    { id: "t0", from_state: "q0", input_symbol: "a", stack_top: "Z", to_state: "q0", push_symbols: ["A", "Z"] },
    { id: "t1", from_state: "q0", input_symbol: "a", stack_top: "A", to_state: "q0", push_symbols: ["A", "A"] },
    { id: "t2", from_state: "q0", input_symbol: "b", stack_top: "A", to_state: "q1", push_symbols: [] },
    { id: "t3", from_state: "q1", input_symbol: "b", stack_top: "A", to_state: "q1", push_symbols: [] },
    { id: "t4", from_state: "q1", input_symbol: EPSILON, stack_top: "Z", to_state: "accept", push_symbols: ["Z"] },
  ],
  start_state: "q0",
  final_states: ["accept"],
  initial_stack_symbol: "Z",
};

const blankTransition = (pda) => ({
  from_state: pda.states[0] || "",
  input_symbol: pda.input_alphabet[0] || EPSILON,
  stack_top: pda.stack_alphabet[0] || "",
  to_state: pda.states[0] || "",
  push_symbols: [],
});

function parseSymbolList(value, label, { allowEmpty = false, singleCharacter = false } = {}) {
  const symbols = value
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);
  if (!allowEmpty && symbols.length === 0) {
    throw new Error(`Enter at least one ${label}.`);
  }
  if (new Set(symbols).size !== symbols.length) {
    throw new Error(`${label[0].toUpperCase()}${label.slice(1)} must be unique.`);
  }
  if (symbols.some((symbol) => /\s/.test(symbol))) {
    throw new Error(`${label[0].toUpperCase()}${label.slice(1)} cannot contain whitespace.`);
  }
  if (singleCharacter && symbols.some((symbol) => [...symbol].length !== 1)) {
    throw new Error(`${label[0].toUpperCase()}${label.slice(1)} must be single characters.`);
  }
  return symbols;
}

function StackView({ symbols, initialSymbol }) {
  if (!symbols?.length) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <span className="text-2xl text-slate-500">∅</span>
        <span className="mt-2 text-xs uppercase tracking-wider text-slate-500">
          Stack empty
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-48 flex-col items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
        TOP
      </span>
      {symbols.map((symbol, index) => {
        const isBottom = index === symbols.length - 1;
        return (
          <div
            key={`${symbol}-${index}`}
            className={`flex h-10 w-20 items-center justify-center border font-mono text-lg ${
              index === 0
                ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                : "border-slate-700 text-slate-300"
            }`}
          >
            {symbol}
            {isBottom && symbol === initialSymbol && (
              <span className="ml-1 text-[9px] text-slate-500">bottom</span>
            )}
          </div>
        );
      })}
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        BOTTOM
      </span>
    </div>
  );
}

function StackSnapshot({ symbols }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 font-mono text-xs">
      {symbols.length === 0 ? (
        <span className="text-amber-300">∅ (empty)</span>
      ) : (
        symbols.map((symbol, index) => (
          <span
            key={`${symbol}-${index}`}
            className={`rounded border px-1.5 py-0.5 ${
              index === 0
                ? "border-cyan-500/50 text-cyan-200"
                : "border-slate-700 text-slate-400"
            }`}
          >
            {symbol}
          </span>
        ))
      )}
    </span>
  );
}

function Field({ label, value, onChange, children, type = "text" }) {
  return (
    <label className="block text-sm text-slate-300">
      {label}
      {children || (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
      )}
    </label>
  );
}

function PdaLab() {
  const [pda, setPda] = useState(initialPda);
  const [inputAlphabetText, setInputAlphabetText] = useState(
    initialPda.input_alphabet.join(", ")
  );
  const [stackAlphabetText, setStackAlphabetText] = useState(
    initialPda.stack_alphabet.join(", ")
  );
  const [inputString, setInputString] = useState("aabb");
  const [transitionDraft, setTransitionDraft] = useState(null);
  const [pushText, setPushText] = useState("");
  const [result, setResult] = useState(null);
  const [selectedStep, setSelectedStep] = useState(0);
  const [error, setError] = useState("");
  const [validationMessages, setValidationMessages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const clearSimulation = () => {
    setResult(null);
    setSelectedStep(0);
    setError("");
    setValidationMessages([]);
  };

  const updatePda = (updater) => {
    setPda((current) => updater(current));
    clearSimulation();
  };

  const updateAlphabet = (field, value) => {
    clearSimulation();
    if (field === "input_alphabet") setInputAlphabetText(value);
    else setStackAlphabetText(value);
    try {
      const symbols = parseSymbolList(
        value,
        field === "input_alphabet" ? "input symbol" : "stack symbol",
        {
          allowEmpty: field === "input_alphabet",
          singleCharacter: field === "input_alphabet",
        }
      );
      updatePda((current) => ({ ...current, [field]: symbols }));
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const addState = () => {
    updatePda((current) => {
      let next = 0;
      while (current.states.includes(`q${next}`)) next += 1;
      const newState = `q${next}`;
      return { ...current, states: [...current.states, newState] };
    });
  };

  const deleteState = (state) => {
    updatePda((current) => {
      const states = current.states.filter((item) => item !== state);
      return {
        ...current,
        states,
        start_state: current.start_state === state ? states[0] || "" : current.start_state,
        final_states: current.final_states.filter((item) => item !== state),
        transitions: current.transitions.filter(
          (transition) => transition.from_state !== state && transition.to_state !== state
        ),
      };
    });
    setTransitionDraft(null);
  };

  const openTransitionEditor = (transition = null) => {
    const draft = transition
      ? { ...transition, push_symbols: [...transition.push_symbols] }
      : blankTransition(pda);
    setTransitionDraft(draft);
    setPushText(draft.push_symbols.join(", "));
    setError("");
  };

  const saveTransition = () => {
    if (!transitionDraft) return;
    try {
      const replacementText = pushText.trim();
      const pushSymbols =
        !replacementText || replacementText === EPSILON || replacementText === "e"
          ? []
          : parseSymbolList(replacementText, "replacement stack symbol");
      const transition = {
        ...transitionDraft,
        push_symbols: pushSymbols,
      };
      if (!pda.states.includes(transition.from_state) || !pda.states.includes(transition.to_state)) {
        throw new Error("Transition states must be selected from the declared states.");
      }
      if (
        transition.input_symbol !== EPSILON &&
        !pda.input_alphabet.includes(transition.input_symbol)
      ) {
        throw new Error("Transition input must be ε or a declared input symbol.");
      }
      if (
        !pda.stack_alphabet.includes(transition.stack_top) ||
        pushSymbols.some((symbol) => !pda.stack_alphabet.includes(symbol))
      ) {
        throw new Error("Stack top and replacement symbols must be in the stack alphabet.");
      }

      updatePda((current) => {
        const existingIndex = transition.id
          ? current.transitions.findIndex((item) => item.id === transition.id)
          : -1;
        const saved = {
          ...transition,
          id: transition.id || `transition-${Date.now()}-${transitionId++}`,
        };
        if (existingIndex < 0) {
          return { ...current, transitions: [...current.transitions, saved] };
        }
        const transitions = [...current.transitions];
        transitions[existingIndex] = saved;
        return { ...current, transitions };
      });
      setTransitionDraft(null);
      setError("");
    } catch (saveError) {
      setError(saveError.message || "Unable to save this transition.");
    }
  };

  const deleteTransition = (id) => {
    updatePda((current) => ({
      ...current,
      transitions: current.transitions.filter((transition) => transition.id !== id),
    }));
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setError("");
    setValidationMessages([]);
    try {
      const machine = pdaPayload({
        ...pda,
        input_alphabet: parseSymbolList(inputAlphabetText, "input symbol", {
          allowEmpty: true,
          singleCharacter: true,
        }),
        stack_alphabet: parseSymbolList(stackAlphabetText, "stack symbol"),
      });
      const validation = await validatePda(machine);
      setValidationMessages(validation.errors || []);
      if (validation.valid) setValidationMessages(["PDA configuration is valid."]);
    } catch (validationError) {
      setError(validationError.message || "PDA validation failed.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSimulate = async () => {
    setIsRunning(true);
    setError("");
    setValidationMessages([]);
    setResult(null);
    setSelectedStep(0);
    try {
      const machine = pdaPayload({
        ...pda,
        input_alphabet: parseSymbolList(inputAlphabetText, "input symbol", {
          allowEmpty: true,
          singleCharacter: true,
        }),
        stack_alphabet: parseSymbolList(stackAlphabetText, "stack symbol"),
      });
      const validation = await validatePda(machine);
      if (!validation.valid) {
        setValidationMessages(validation.errors || ["PDA configuration is invalid."]);
        return;
      }
      const simulation = await simulatePda(machine, inputString);
      setResult(simulation);
      setSelectedStep(simulation.trace?.length || 0);
    } catch (simulationError) {
      setError(simulationError.message || "PDA simulation failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const trace = result?.trace || [];
  const currentTraceStep = selectedStep > 0 ? trace[selectedStep - 1] : null;
  const currentState = currentTraceStep?.to_state || pda.start_state;
  const currentStack =
    currentTraceStep?.stack_after ||
    (selectedStep === 0 ? [pda.initial_stack_symbol] : result?.stack || []);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-[1500px] px-6 py-10">
        <Link to="/learn" className="text-sm text-slate-500 hover:text-cyan-400">
          ← Back to Learn
        </Link>
        <div className="mt-5 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-cyan-400">
            PDA Lab
          </span>
          <h1 className="mt-3 text-3xl font-bold">Pushdown Automaton</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Configure a nondeterministic PDA and inspect its input, state, and
            complete stack trace. Acceptance uses configured final states.
          </p>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(350px,0.85fr)_minmax(0,1.5fr)]">
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-semibold">PDA Configuration</h2>
              <p className="mt-1 text-sm text-slate-500">
                Input symbols are single characters. Configure stack operations
                top-first.
              </p>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-300">States</h3>
                  <button
                    type="button"
                    onClick={addState}
                    className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    + Add state
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pda.states.map((state) => (
                    <span
                      key={state}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-sm text-slate-200"
                    >
                      {state}
                      <button
                        type="button"
                        aria-label={`Remove state ${state}`}
                        onClick={() => deleteState(state)}
                        className="text-slate-500 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Input alphabet (comma-separated)">
                  <input
                    value={inputAlphabetText}
                    onChange={(event) => updateAlphabet("input_alphabet", event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </Field>
                <Field label="Stack alphabet (comma-separated)">
                  <input
                    value={stackAlphabetText}
                    onChange={(event) => updateAlphabet("stack_alphabet", event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </Field>
                <Field label="Start state">
                  <select
                    value={pda.start_state}
                    onChange={(event) =>
                      updatePda((current) => ({ ...current, start_state: event.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    {pda.states.map((state) => <option key={state}>{state}</option>)}
                  </select>
                </Field>
                <Field label="Initial stack symbol">
                  <select
                    value={pda.initial_stack_symbol}
                    onChange={(event) =>
                      updatePda((current) => ({
                        ...current,
                        initial_stack_symbol: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    {pda.stack_alphabet.map((symbol) => <option key={symbol}>{symbol}</option>)}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-300">Accepting states</h3>
                <div className="mt-2 flex flex-wrap gap-3">
                  {pda.states.map((state) => (
                    <label key={state} className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={pda.final_states.includes(state)}
                        onChange={() =>
                          updatePda((current) => ({
                            ...current,
                            final_states: current.final_states.includes(state)
                              ? current.final_states.filter((item) => item !== state)
                              : [...current.final_states, state],
                          }))
                        }
                        className="accent-cyan-500"
                      />
                      {state}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  A computation accepts when all input is consumed and it ends in a selected accepting state.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Transitions</h2>
                <button
                  type="button"
                  onClick={() => openTransitionEditor()}
                  disabled={!pda.states.length || !pda.stack_alphabet.length}
                  className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-40"
                >
                  + Add transition
                </button>
              </div>

              {transitionDraft && (
                <div className="mt-4 space-y-3 rounded-lg border border-cyan-500/30 bg-slate-950/80 p-4">
                  <h3 className="text-sm font-semibold text-cyan-200">
                    {transitionDraft.id ? "Edit transition" : "New transition"}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["from_state", "Current state", pda.states],
                      ["input_symbol", "Input symbol", [EPSILON, ...pda.input_alphabet]],
                      ["stack_top", "Required stack top", pda.stack_alphabet],
                      ["to_state", "Next state", pda.states],
                    ].map(([field, label, options]) => (
                      <Field key={field} label={label}>
                        <select
                          value={transitionDraft[field]}
                          onChange={(event) =>
                            setTransitionDraft((current) => ({
                              ...current,
                              [field]: event.target.value,
                            }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                        >
                          {options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </Field>
                    ))}
                    <Field label="Replacement stack symbols (top-first; blank / ε pops)">
                      <input
                        value={pushText}
                        onChange={(event) => setPushText(event.target.value)}
                        placeholder="e.g. A, Z"
                        className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white"
                      />
                    </Field>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setTransitionDraft(null)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveTransition}
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                    >
                      Save transition
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {pda.transitions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                    No transitions configured.
                  </p>
                ) : (
                  pda.transitions.map((transition) => (
                    <article
                      key={transition.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
                    >
                      <p className="font-mono text-sm text-slate-200">
                        δ({transition.from_state}, {transition.input_symbol}, {transition.stack_top}) = ({transition.to_state}, {transition.push_symbols.join(", ") || "ε"})
                      </p>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openTransitionEditor(transition)}
                          className="rounded border border-slate-700 px-2 py-1 text-xs text-cyan-300 hover:border-cyan-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTransition(transition.id)}
                          className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-5">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-semibold">Input Simulation</h2>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <Field label="Input string" value={inputString} onChange={(event) => {
                  setInputString(event.target.value);
                  clearSimulation();
                }} />
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={isRunning || isValidating}
                  className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50"
                >
                  {isRunning ? "Simulating..." : "Simulate PDA"}
                </button>
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={isRunning || isValidating}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-500 disabled:opacity-50"
                >
                  {isValidating ? "Validating..." : "Validate"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Simulation explores at most 1,000 unique configurations.
              </p>
              {(error || validationMessages.length > 0) && (
                <div
                  role={
                    !error &&
                    validationMessages.length === 1 &&
                    validationMessages[0] === "PDA configuration is valid."
                      ? "status"
                      : "alert"
                  }
                  className={`mt-4 space-y-1 rounded-lg p-3 text-sm ${
                    !error &&
                    validationMessages.length === 1 &&
                    validationMessages[0] === "PDA configuration is valid."
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  {error && <p>{error}</p>}
                  {validationMessages.map((message, index) => (
                    <p key={`${index}-${message}`}>{message}</p>
                  ))}
                </div>
              )}
              {result && (
                <div
                  className={`mt-4 rounded-lg p-4 ${
                    result.accepted ? "bg-emerald-500/10" : "bg-red-500/10"
                  }`}
                >
                  <p className={`text-xl font-bold ${result.accepted ? "text-emerald-300" : "text-red-300"}`}>
                    {result.accepted ? "ACCEPTED" : "REJECTED"}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{result.explanation}</p>
                  {result.error && (
                    <p className="mt-1 text-xs text-slate-400">{result.error}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Acceptance mode: final state · Final state: {result.final_state || "none"} · Input consumed: {result.input_position ?? 0}/{inputString.length}
                  </p>
                </div>
              )}
            </section>

            <div className="grid gap-5 md:grid-cols-[190px_minmax(0,1fr)]">
              <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h2 className="text-lg font-semibold">Live Stack</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Step {selectedStep} · top is shown first
                </p>
                <div className="mt-4">
                  <StackView
                    symbols={currentStack}
                    initialSymbol={pda.initial_stack_symbol}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Current state: <span className="font-mono text-cyan-300">{currentState || "none"}</span>
                </p>
                {result && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStep((step) => Math.max(0, step - 1))}
                      disabled={selectedStep === 0}
                      className="flex-1 rounded-lg border border-slate-700 px-2 py-2 text-xs text-slate-300 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStep((step) => Math.min(trace.length, step + 1))}
                      disabled={selectedStep >= trace.length}
                      className="flex-1 rounded-lg border border-slate-700 px-2 py-2 text-xs text-slate-300 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>

              <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h2 className="text-lg font-semibold">Execution Trace</h2>
                {!result ? (
                  <p className="mt-8 text-sm text-slate-500">
                    Run the PDA to inspect each transition and stack snapshot.
                  </p>
                ) : trace.length === 0 ? (
                  <p className="mt-4 rounded-lg bg-slate-950 p-3 text-sm text-slate-400">
                    No transition was taken. The initial configuration is shown in the live stack panel.
                  </p>
                ) : (
                  <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
                    {trace.map((step, index) => (
                      <button
                        type="button"
                        key={`step-${step.step}`}
                        onClick={() => setSelectedStep(index + 1)}
                        className={`block w-full rounded-lg border p-3 text-left ${
                          selectedStep === index + 1
                            ? "border-cyan-500/60 bg-cyan-500/5"
                            : "border-slate-800 bg-slate-950/60 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-cyan-300">
                          <span>Step {step.step}</span>
                          <span>{step.state} → {step.to_state}</span>
                          <span>read {step.input_symbol === EPSILON ? EPSILON : `"${step.input_symbol}"`}</span>
                          <span>input {step.input_position}/{inputString.length}</span>
                        </div>
                        <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                          <p className="text-slate-400">
                            Before: <StackSnapshot symbols={step.stack_before} />
                          </p>
                          <p className="text-slate-400">
                            After: <StackSnapshot symbols={step.stack_after} />
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {step.explanation}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function pdaPayload(pda) {
  return {
    states: pda.states,
    input_alphabet: pda.input_alphabet,
    stack_alphabet: pda.stack_alphabet,
    transitions: pda.transitions.map(
      ({ from_state, input_symbol, stack_top, to_state, push_symbols }) => ({
        from_state,
        input_symbol,
        stack_top,
        to_state,
        push_symbols,
      })
    ),
    start_state: pda.start_state,
    final_states: pda.final_states,
    initial_stack_symbol: pda.initial_stack_symbol,
  };
}

export default PdaLab;
