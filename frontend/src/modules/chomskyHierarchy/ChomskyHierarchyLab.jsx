import { useState } from "react";
import { Link } from "react-router";
import { classifyGrammar } from "../../services/api";

const initialGrammar = {
  variables: "S",
  terminals: "a, b",
  startSymbol: "S",
  productions: "S -> a S b | ε",
};
const levels = [
  { type: 0, label: "Unrestricted", machine: "Turing Machine", color: "border-red-500/50" },
  { type: 1, label: "Context-Sensitive", machine: "Linear Bounded Automaton", color: "border-orange-500/50" },
  { type: 2, label: "Context-Free", machine: "PDA", color: "border-cyan-500/50" },
  { type: 3, label: "Regular", machine: "DFA / NFA", color: "border-emerald-500/50" },
];

function parseGrammar(form) {
  const variables = form.variables.split(",").map((symbol) => symbol.trim()).filter(Boolean);
  const terminals = form.terminals.split(",").map((symbol) => symbol.trim()).filter(Boolean);
  const productions = {};
  const errors = [];

  if (variables.length === 0) errors.push("Enter at least one variable.");
  if (terminals.length === 0) errors.push("Enter at least one terminal.");
  if (!variables.includes(form.startSymbol.trim())) errors.push("The start symbol must be one of the declared variables.");
  if (new Set(variables).size !== variables.length) errors.push("Variables must not contain duplicates.");
  if (new Set(terminals).size !== terminals.length) errors.push("Terminals must not contain duplicates.");
  if (variables.some((symbol) => terminals.includes(symbol))) errors.push("Variables and terminals must be distinct.");

  for (const [index, line] of form.productions.split("\n").entries()) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const separator = trimmedLine.indexOf("->");
    if (separator < 0) {
      errors.push(`Production line ${index + 1} must use "->".`);
      continue;
    }

    const left = trimmedLine.slice(0, separator).trim();
    const right = trimmedLine.slice(separator + 2).trim();
    if (!left || left.split(/\s+/).length !== 1) {
      errors.push(`Production line ${index + 1} must have one symbol on the left side.`);
      continue;
    }
    if (!right) {
      errors.push(`Production line ${index + 1} must have at least one alternative (use ε for an empty production).`);
      continue;
    }

    if (!productions[left]) productions[left] = [];
    for (const alternative of right.split("|")) {
      const value = alternative.trim();
      const replacement = value === "ε" || value.toLowerCase() === "epsilon"
        ? []
        : value.split(/\s+/);
      for (const symbol of replacement) {
        if (!variables.includes(symbol) && !terminals.includes(symbol)) {
          errors.push(`Production line ${index + 1} uses undeclared symbol "${symbol}".`);
        }
      }
      productions[left].push(replacement);
    }
  }

  if (Object.keys(productions).length === 0) errors.push("Enter at least one production.");
  if (Object.keys(productions).some((left) => !variables.includes(left))) {
    errors.push("Each production's left-side symbol must be a declared variable.");
  }

  if (errors.length > 0) return { errors };
  return {
    grammar: {
      variables,
      terminals,
      productions,
      start_symbol: form.startSymbol.trim(),
    },
    errors: [],
  };
}

function ChomskyHierarchyLab() {
  const [form, setForm] = useState(initialGrammar);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setResult(null);
    setError("");
  };
  const handleClassify = async () => {
    const parsed = parseGrammar(form);
    if (parsed.errors.length > 0) {
      setResult(null);
      setError(parsed.errors.join(" "));
      return;
    }

    setIsClassifying(true);
    setError("");
    try {
      setResult(await classifyGrammar(parsed.grammar));
    } catch (classificationError) {
      setError(classificationError.message || "Unable to connect to the TOC algorithm engine.");
    } finally {
      setIsClassifying(false);
    }
  };

  const inputClassName = "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white";
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/learn" className="text-sm text-slate-500 hover:text-cyan-400">← Back to Learn</Link>
        <div className="mt-5 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-cyan-400">Theory Map</span>
          <h1 className="mt-3 text-3xl font-bold">Chomsky Hierarchy</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Formal languages form a containment hierarchy, with each level paired to a computational model.</p>
        </div>
        <div className="mt-8 space-y-3">
          {levels.map((level) => (
            <article key={level.type} className={`rounded-xl border bg-slate-900/60 p-5 ${level.color}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><span className="text-xs text-slate-500">TYPE {level.type}</span><h2 className="mt-1 text-xl font-semibold">{level.label}</h2></div>
                <span className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-cyan-300">{level.machine}</span>
              </div>
              {level.type < 3 && <p className="mt-3 text-sm text-slate-500">Contains the language classes below it.</p>}
            </article>
          ))}
        </div>
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold">Classify a grammar</h2>
          <p className="mt-2 text-sm text-slate-400">Edit the grammar below. Separate symbols with commas and write one production per line; separate alternatives with | and use ε for an empty production.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Variables (comma-separated)
              <input value={form.variables} onChange={(event) => update("variables", event.target.value)} className={inputClassName} />
            </label>
            <label className="text-sm text-slate-300">Terminals (comma-separated)
              <input value={form.terminals} onChange={(event) => update("terminals", event.target.value)} className={inputClassName} />
            </label>
            <label className="text-sm text-slate-300">Start symbol
              <input value={form.startSymbol} onChange={(event) => update("startSymbol", event.target.value)} className={inputClassName} />
            </label>
            <label className="text-sm text-slate-300 sm:col-span-2">Productions
              <textarea value={form.productions} onChange={(event) => update("productions", event.target.value)} rows={5} className={`${inputClassName} font-mono`} />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">Example: S -&gt; a S b | ε</p>
          <button onClick={handleClassify} disabled={isClassifying} className="mt-5 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50">
            {isClassifying ? "Classifying..." : "Classify grammar"}
          </button>
          {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
          {result && (
            <div className="mt-5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
              <p className="text-lg font-semibold text-cyan-300">Type {result.type}: {result.label}</p>
              <p className="mt-2 text-sm text-slate-300">{result.explanation}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {result.relationships.map((relationship) => (
                  <div key={relationship.type} className="rounded-lg border border-slate-700 bg-slate-950/50 p-3 text-sm">
                    <p className="font-semibold text-slate-200">Type {relationship.type}: {relationship.label}</p>
                    <p className="mt-1 text-cyan-300">{relationship.machine}</p>
                    <p className="mt-1 text-slate-500">{relationship.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default ChomskyHierarchyLab;
