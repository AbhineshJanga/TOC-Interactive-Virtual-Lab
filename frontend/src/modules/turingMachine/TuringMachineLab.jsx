import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  simulateTuringMachine,
  validateTuringMachine,
} from "../../services/api";

const defaultMachine = {
  states: ["q0", "q0_seen_1", "q0_seen_0", "accept", "reject"],
  input_alphabet: ["0", "1"],
  tape_alphabet: ["0", "1", "B"],
  transitions: [
    { id: "t0", current_state: "q0", read_symbol: "0", write_symbol: "0", move: "R", next_state: "q0_seen_0" },
    { id: "t1", current_state: "q0", read_symbol: "1", write_symbol: "1", move: "R", next_state: "q0_seen_1" },
    { id: "t2", current_state: "q0", read_symbol: "B", write_symbol: "B", move: "R", next_state: "reject" },
    { id: "t3", current_state: "q0_seen_0", read_symbol: "0", write_symbol: "0", move: "R", next_state: "q0_seen_0" },
    { id: "t4", current_state: "q0_seen_0", read_symbol: "1", write_symbol: "1", move: "R", next_state: "q0_seen_1" },
    { id: "t5", current_state: "q0_seen_0", read_symbol: "B", write_symbol: "B", move: "R", next_state: "reject" },
    { id: "t6", current_state: "q0_seen_1", read_symbol: "0", write_symbol: "0", move: "R", next_state: "q0_seen_0" },
    { id: "t7", current_state: "q0_seen_1", read_symbol: "1", write_symbol: "1", move: "R", next_state: "q0_seen_1" },
    { id: "t8", current_state: "q0_seen_1", read_symbol: "B", write_symbol: "B", move: "R", next_state: "accept" },
  ],
  start_state: "q0",
  accept_state: "accept",
  reject_state: "reject",
  blank_symbol: "B",
};

let transitionSequence = 0;

function parseAlphabet(value, label) {
  const symbols = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (new Set(symbols).size !== symbols.length) {
    throw new Error(`${label} symbols must be unique.`);
  }
  if (symbols.some((symbol) => [...symbol].length !== 1)) {
    throw new Error(`${label} symbols must be single characters.`);
  }
  return symbols;
}

function Tape({ cells }) {
  if (!cells?.length) {
    return (
      <p className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-sm text-slate-500">
        No tape snapshot is available.
      </p>
    );
  }
  return (
    <div className="flex min-w-max justify-center gap-1 px-8 py-8">
      {cells.map((cell) => (
        <div
          key={cell.position}
          className={`relative flex h-16 w-16 shrink-0 items-center justify-center border font-mono text-xl ${
            cell.head
              ? "border-cyan-400 bg-cyan-500/15 text-cyan-200 ring-2 ring-cyan-500/30"
              : "border-slate-700 bg-slate-950 text-slate-300"
          }`}
        >
          {cell.symbol}
          {cell.head && (
            <span className="absolute -top-6 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300">
              HEAD
            </span>
          )}
          <span className="absolute -bottom-5 text-[10px] text-slate-600">
            {cell.position}
          </span>
        </div>
      ))}
    </div>
  );
}

function MachineField({ label, children }) {
  return (
    <label className="block text-sm text-slate-300">
      {label}
      {children}
    </label>
  );
}

function TuringMachineLab() {
  const [machine, setMachine] = useState(defaultMachine);
  const [inputAlphabetText, setInputAlphabetText] = useState(
    defaultMachine.input_alphabet.join(", ")
  );
  const [tapeAlphabetText, setTapeAlphabetText] = useState(
    defaultMachine.tape_alphabet.join(", ")
  );
  const [inputString, setInputString] = useState("101");
  const [maxSteps, setMaxSteps] = useState(1000);
  const [result, setResult] = useState(null);
  const [selectedStep, setSelectedStep] = useState(0);
  const [transitionDraft, setTransitionDraft] = useState(null);
  const [error, setError] = useState("");
  const [validationMessages, setValidationMessages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);

  const clearRun = () => {
    setResult(null);
    setSelectedStep(0);
    setIsPlaying(false);
    setError("");
    setValidationMessages([]);
  };

  const updateMachine = (updater) => {
    setMachine((current) => updater(current));
    clearRun();
  };

  const configuration = useMemo(
    () => ({
      ...machine,
      transitions: machine.transitions.map((transition) => ({
        current_state: transition.current_state,
        read_symbol: transition.read_symbol,
        write_symbol: transition.write_symbol,
        move: transition.move,
        next_state: transition.next_state,
      })),
    }),
    [machine]
  );

  const validateConfiguration = async () => {
    const validation = await validateTuringMachine(configuration);
    setValidationMessages(validation.errors || []);
    if (validation.valid) {
      setValidationMessages(["Machine configuration is valid."]);
    }
    return validation.valid;
  };

  const handleValidate = async () => {
    setError("");
    setValidationMessages([]);
    setIsValidating(true);
    try {
      await validateConfiguration();
    } catch (validationError) {
      setError(validationError.message || "Turing machine validation failed.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setIsPlaying(false);
    setError("");
    setValidationMessages([]);
    setResult(null);
    setSelectedStep(0);
    try {
      if (!Number.isInteger(Number(maxSteps)) || Number(maxSteps) < 1 || Number(maxSteps) > 10000) {
        setError("Maximum steps must be a whole number from 1 to 10,000.");
        return;
      }
      if ([...inputString].length > Number(maxSteps)) {
        setError("Maximum steps must be at least the length of the input.");
        return;
      }
      if (parseAlphabet(inputAlphabetText, "Input alphabet").join(",") !== machine.input_alphabet.join(",")) {
        throw new Error("Commit the input alphabet edit by leaving the field before running.");
      }
      if (parseAlphabet(tapeAlphabetText, "Tape alphabet").join(",") !== machine.tape_alphabet.join(",")) {
        throw new Error("Commit the tape alphabet edit by leaving the field before running.");
      }
      if (!(await validateConfiguration())) return;
      const simulation = await simulateTuringMachine(
        configuration,
        inputString,
        Number(maxSteps)
      );
      setResult(simulation);
      setSelectedStep(simulation.trace.length);
    } catch (simulationError) {
      setError(simulationError.message || "Turing machine simulation failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const updateAlphabet = (field, value) => {
    if (field === "input_alphabet") setInputAlphabetText(value);
    else setTapeAlphabetText(value);
    try {
      const symbols = parseAlphabet(value, field === "input_alphabet" ? "Input alphabet" : "Tape alphabet");
      updateMachine((current) => ({ ...current, [field]: symbols }));
    } catch (alphabetError) {
      clearRun();
      setError(alphabetError.message);
    }
  };

  const addState = () => {
    updateMachine((current) => {
      let index = 0;
      while (current.states.includes(`q${index}`)) index += 1;
      return { ...current, states: [...current.states, `q${index}`] };
    });
  };

  const removeState = (state) => {
    updateMachine((current) => {
      const states = current.states.filter((item) => item !== state);
      const fallback = states[0] || "";
      const acceptState = current.accept_state === state
        ? states.find((item) => item !== current.reject_state) || fallback
        : current.accept_state;
      const rejectState = current.reject_state === state
        ? states.find((item) => item !== acceptState) || fallback
        : current.reject_state;
      return {
        ...current,
        states,
        start_state: current.start_state === state ? fallback : current.start_state,
        accept_state: acceptState,
        reject_state: rejectState,
        transitions: current.transitions.filter(
          (transition) =>
            transition.current_state !== state && transition.next_state !== state
        ),
      };
    });
    setTransitionDraft(null);
  };

  const openTransitionEditor = (transition = null) => {
    setError("");
    setTransitionDraft(
      transition
        ? { ...transition }
        : {
            current_state: machine.states[0] || "",
            read_symbol: machine.tape_alphabet[0] || "",
            write_symbol: machine.tape_alphabet[0] || "",
            move: "R",
            next_state: machine.states[0] || "",
          }
    );
  };

  const saveTransition = () => {
    if (!transitionDraft) return;
    const transition = { ...transitionDraft };
    if (!machine.states.includes(transition.current_state) || !machine.states.includes(transition.next_state)) {
      setError("Transition states must be selected from the declared states.");
      return;
    }
    if (!machine.tape_alphabet.includes(transition.read_symbol) || !machine.tape_alphabet.includes(transition.write_symbol)) {
      setError("Read and write symbols must be in the tape alphabet.");
      return;
    }
    if (!["L", "R"].includes(transition.move)) {
      setError("The existing Turing Machine engine supports L and R movements only.");
      return;
    }
    const duplicate = machine.transitions.some(
      (item) =>
        item.id !== transition.id &&
        item.current_state === transition.current_state &&
        item.read_symbol === transition.read_symbol
    );
    if (duplicate) {
      setError("A transition for this state and read symbol already exists.");
      return;
    }
    updateMachine((current) => {
      const existingIndex = transition.id
        ? current.transitions.findIndex((item) => item.id === transition.id)
        : -1;
      const saved = {
        ...transition,
        id: transition.id || `tm-${Date.now()}-${transitionSequence++}`,
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
  };

  const deleteTransition = (id) => {
    updateMachine((current) => ({
      ...current,
      transitions: current.transitions.filter((transition) => transition.id !== id),
    }));
  };

  useEffect(() => {
    if (!isPlaying || !result) return undefined;
    if (selectedStep >= result.trace.length) return undefined;
    const timer = setTimeout(
      () => {
        const nextStep = Math.min(result.trace.length, selectedStep + 1);
        setSelectedStep(nextStep);
        if (nextStep >= result.trace.length) setIsPlaying(false);
      },
      speed
    );
    return () => clearTimeout(timer);
  }, [isPlaying, result, selectedStep, speed]);

  const trace = result?.trace || [];
  const selectedTransition = selectedStep > 0 ? trace[selectedStep - 1] : null;
  const tape = selectedTransition?.tape ||
    (result && trace.length === 0 ? result.tape : null) ||
    (selectedStep === 0 ? initialTape(inputString, machine.blank_symbol) : result?.tape);
  const currentState = selectedTransition?.next_state ||
    (result && trace.length === 0 ? result.state : machine.start_state);
  const currentHead = selectedTransition
    ? tape?.find((cell) => cell.head)?.position
    : result && trace.length === 0
      ? result.head
      : 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-[1500px] px-6 py-10">
        <Link to="/learn" className="text-sm text-slate-500 hover:text-cyan-400">
          ← Back to Learn
        </Link>
        <div className="mt-5 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-cyan-400">
            Turing Machine Lab
          </span>
          <h1 className="mt-3 text-3xl font-bold">Tape-Based Computation</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Configure a deterministic Turing machine, then inspect each tape
            operation. The default machine accepts binary inputs whose last
            symbol is 1.
          </p>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(350px,0.85fr)_minmax(0,1.5fr)]">
          <section className="h-fit rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Turing Machine Configuration</h2>
                <p className="mt-1 text-xs text-slate-500">The backend supports left and right moves.</p>
              </div>
              <button
                type="button"
                onClick={addState}
                className="rounded-lg border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10"
              >
                + Add state
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {machine.states.map((state) => (
                <span key={state} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-200">
                  {state}
                  <button
                    type="button"
                    aria-label={`Remove state ${state}`}
                    onClick={() => removeState(state)}
                    className="text-slate-500 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <MachineField label="Input alphabet (comma-separated)">
                <input
                  value={inputAlphabetText}
                  onChange={(event) => updateAlphabet("input_alphabet", event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </MachineField>
              <MachineField label="Tape alphabet (comma-separated, includes blank)">
                <input
                  value={tapeAlphabetText}
                  onChange={(event) => updateAlphabet("tape_alphabet", event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </MachineField>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["start_state", "Start state"],
                  ["accept_state", "Accepting state"],
                  ["reject_state", "Rejecting state"],
                ].map(([field, label]) => (
                  <MachineField key={field} label={label}>
                    <select
                      value={machine[field]}
                      onChange={(event) =>
                        updateMachine((current) => ({ ...current, [field]: event.target.value }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    >
                      {machine.states.map((state) => <option key={state}>{state}</option>)}
                    </select>
                  </MachineField>
                ))}
                <MachineField label="Blank symbol">
                  <select
                    value={machine.blank_symbol}
                    onChange={(event) =>
                      updateMachine((current) => ({ ...current, blank_symbol: event.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    {machine.tape_alphabet.map((symbol) => <option key={symbol}>{symbol}</option>)}
                  </select>
                </MachineField>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-200">Transitions</h3>
                <button
                  type="button"
                  onClick={() => openTransitionEditor()}
                  disabled={!machine.states.length || !machine.tape_alphabet.length}
                  className="rounded-lg border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-40"
                >
                  + Add transition
                </button>
              </div>
              {transitionDraft && (
                <div className="mt-3 space-y-3 rounded-lg border border-cyan-500/30 bg-slate-950 p-3">
                  <h4 className="text-sm font-semibold text-cyan-200">
                    {transitionDraft.id ? "Edit transition" : "New transition"}
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["current_state", "Current state", machine.states],
                      ["read_symbol", "Read symbol", machine.tape_alphabet],
                      ["write_symbol", "Write symbol", machine.tape_alphabet],
                      ["move", "Head movement", ["L", "R"]],
                      ["next_state", "Next state", machine.states],
                    ].map(([field, label, options]) => (
                      <MachineField key={field} label={label}>
                        <select
                          value={transitionDraft[field]}
                          onChange={(event) =>
                            setTransitionDraft((current) => ({
                              ...current,
                              [field]: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-white"
                        >
                          {options.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </MachineField>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setTransitionDraft(null)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300">Cancel</button>
                    <button type="button" onClick={saveTransition} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white">Save transition</button>
                  </div>
                </div>
              )}
              <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {machine.transitions.map((transition) => (
                  <article key={transition.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="font-mono text-xs leading-5 text-slate-200">
                      δ({transition.current_state}, {transition.read_symbol}) = ({transition.next_state}, {transition.write_symbol}, {transition.move})
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      <button type="button" onClick={() => openTransitionEditor(transition)} className="rounded border border-slate-700 px-2 py-1 text-xs text-cyan-300">Edit</button>
                      <button type="button" onClick={() => deleteTransition(transition.id)} className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300">Delete</button>
                    </div>
                  </article>
                ))}
                {machine.transitions.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-500">No transitions configured.</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleValidate}
              disabled={isRunning || isValidating}
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-500 disabled:opacity-50"
            >
              {isValidating ? "Validating..." : "Validate Configuration"}
            </button>
            {validationMessages.length > 0 && (
              <div className={`mt-3 space-y-1 rounded-lg p-3 text-xs ${validationMessages[0] === "Machine configuration is valid." ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`} role={validationMessages[0] === "Machine configuration is valid." ? "status" : "alert"}>
                {validationMessages.map((message, index) => <p key={`${index}-${message}`}>{message}</p>)}
              </div>
            )}
          </section>

          <div className="min-w-0 space-y-5">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-semibold">Execution</h2>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <MachineField label="Input string">
                  <input
                    value={inputString}
                    onChange={(event) => {
                      setInputString(event.target.value);
                      clearRun();
                    }}
                    className="mt-1.5 w-full min-w-48 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  />
                </MachineField>
                <MachineField label="Step limit">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={maxSteps}
                    onChange={(event) => setMaxSteps(event.target.value)}
                    className="mt-1.5 w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  />
                </MachineField>
                <button type="button" onClick={handleRun} disabled={isRunning || isValidating} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50">
                  {isRunning ? "Running..." : "Run machine"}
                </button>
                {result && (
                  <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${result.accepted ? "bg-emerald-500/10 text-emerald-300" : result.halted ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>
                    {result.accepted ? "ACCEPTED" : result.halted ? "REJECTED" : "STEP LIMIT"}
                  </span>
                )}
              </div>
              {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
              {result && (
                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-sm text-slate-200">{result.explanation}</p>
                  {result.error && <p className="mt-1 text-xs text-amber-300">{result.error}</p>}
                  <p className="mt-2 text-xs text-slate-500">Final state: {result.state} · Head position: {result.head} · Halted: {result.halted ? "yes" : "no"}</p>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Tape Visualization</h2>
                  <p className="mt-1 text-sm text-slate-500">State {currentState} · Head at tape position {currentHead ?? 0}</p>
                </div>
                <p className="text-xs text-slate-500">Step {selectedStep} / {trace.length}</p>
              </div>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40">
                <Tape cells={tape} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setSelectedStep((step) => Math.max(0, step - 1))} disabled={!result || selectedStep === 0 || isPlaying} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 disabled:opacity-40">Previous</button>
                {isPlaying ? (
                  <button type="button" onClick={() => setIsPlaying(false)} className="rounded-lg border border-amber-500/40 px-3 py-2 text-xs text-amber-200">Pause</button>
                ) : (
                  <button type="button" onClick={() => setIsPlaying(true)} disabled={!result || selectedStep >= trace.length} className="rounded-lg border border-cyan-500/40 px-3 py-2 text-xs text-cyan-200 disabled:opacity-40">Play</button>
                )}
                <button type="button" onClick={() => setSelectedStep((step) => Math.min(trace.length, step + 1))} disabled={!result || selectedStep >= trace.length || isPlaying} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 disabled:opacity-40">Next</button>
                <button type="button" onClick={() => { setIsPlaying(false); setSelectedStep(0); }} disabled={!result || selectedStep === 0 || isPlaying} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 disabled:opacity-40">Reset</button>
                <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                  Animation speed
                  <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-200">
                    <option value={1000}>Slow</option>
                    <option value={600}>Normal</option>
                    <option value={250}>Fast</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-semibold">Detailed Execution Trace</h2>
              {!result ? (
                <p className="mt-4 text-sm text-slate-500">Run the machine to see each transition.</p>
              ) : trace.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No transition was executed. The tape shows the initial configuration.</p>
              ) : (
                <div className="mt-4 max-h-[500px] space-y-2 overflow-y-auto pr-1">
                  {trace.map((step, index) => (
                    <button
                      type="button"
                      key={`step-${step.step}`}
                      onClick={() => { setIsPlaying(false); setSelectedStep(index + 1); }}
                      className={`block w-full rounded-lg border p-3 text-left ${selectedStep === index + 1 ? "border-cyan-500/60 bg-cyan-500/5" : "border-slate-800 bg-slate-950/60 hover:border-slate-600"}`}
                    >
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-cyan-300">
                        <span>Step {step.step}</span>
                        <span>{step.state} → {step.next_state}</span>
                        <span>read {step.read_symbol}</span>
                        <span>write {step.write_symbol}</span>
                        <span>move {step.move}</span>
                        <span>head {step.head} → {step.tape.find((cell) => cell.head)?.position}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{step.explanation}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function initialTape(inputString, blankSymbol) {
  const symbols = [...inputString];
  const right = Math.max(symbols.length - 1, 0) + 2;
  return Array.from({ length: right + 3 }, (_, index) => {
    const position = index - 2;
    return {
      position,
      symbol: symbols[position] ?? blankSymbol,
      head: position === 0,
    };
  });
}

export default TuringMachineLab;
