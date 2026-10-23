import { useState } from "react";
import { Link } from "react-router";
import { convertNfaToDfa } from "../../../services/api";
import { sampleNfa } from "./subsetConstructionData";

function formatSet(states) {
  return `{${states.join(", ") || "∅"}}`;
}

function SubsetConstructionLab() {
  const [conversion, setConversion] = useState(null);
  const [error, setError] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    setError("");
    try {
      setConversion(await convertNfaToDfa(sampleNfa));
    } catch (conversionError) {
      setError(conversionError.message || "Subset construction failed.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/learn" className="text-sm text-slate-500 hover:text-cyan-400">← Back to Learn</Link>
        <div className="mt-5 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-cyan-400">Construction Lab</span>
          <h1 className="mt-3 text-3xl font-bold">NFA → DFA by Subset Construction</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Each DFA state is a set of NFA states. Follow every generated subset and transition instead of jumping straight to the answer.</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Source NFA</h2><span className="text-xs text-cyan-300">q0, q1, q2</span></div>
            <div className="mt-5 space-y-2 text-sm">
              {Object.entries(sampleNfa.transitions).map(([key, targets]) => <div key={key} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2"><span className="text-slate-300">δ({key.replace(",", ", ")})</span><span className="text-cyan-300">{formatSet(targets)}</span></div>)}
            </div>
            <p className="mt-5 text-sm text-slate-500">Start state: <span className="text-slate-300">q0</span> · Final state: <span className="text-emerald-300">q2</span></p>
            <button onClick={handleConvert} disabled={isConverting} className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50">{isConverting ? "Constructing..." : "Run subset construction"}</button>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Generated DFA states</h2><p className="mt-1 text-sm text-slate-500">Accepting DFA states contain at least one NFA final state.</p>{!conversion ? <p className="mt-8 text-sm text-slate-500">Run the construction to generate subset states.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{conversion.subsets.map((subset) => <div key={subset.name} className={`rounded-lg border p-4 ${conversion.dfa.final_states.includes(subset.name) ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-700 bg-slate-950/60"}`}><div className="flex items-center justify-between"><span className="font-semibold text-cyan-300">{subset.name}</span>{conversion.dfa.final_states.includes(subset.name) && <span className="text-xs text-emerald-300">final</span>}</div><p className="mt-2 font-mono text-sm text-slate-200">{formatSet(subset.subset)}</p></div>)}</div>}</section>
        </div>

        {conversion && <section className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Derivation steps</h2><div className="mt-5 space-y-3">{conversion.steps.map((step, index) => <article key={`${step.dfa_state}-${step.symbol}`} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"><div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold text-cyan-300">{index + 1}. {step.dfa_state} = {formatSet(step.source_subset)}</span><span className="text-slate-500">on</span><span className="rounded bg-slate-800 px-2 py-1 text-amber-300">{step.symbol}</span></div><div className="mt-3 grid gap-2 text-sm md:grid-cols-[1fr_auto_1fr] md:items-center"><div className="space-y-1">{step.per_state_moves.map((move) => <p key={`${move.source}-${step.symbol}`}>δ({move.source}, {step.symbol}) = {formatSet(move.targets)}</p>)}</div><span className="text-slate-500">→</span><p className="text-emerald-300">{formatSet(step.destination_subset)} = {step.destination_dfa_state}</p></div><p className="mt-3 text-sm text-slate-500">{step.explanation}</p></article>)}</div></section>}
      </section>
    </main>
  );
}

export default SubsetConstructionLab;
