import { useState } from "react";
import { Link } from "react-router";
import { minimizeDfa } from "../../../services/api";
import { sampleDfa } from "./dfaMinimizationData";

function PartitionList({ partitions }) {
  return <div className="mt-3 grid gap-2 sm:grid-cols-2">{partitions.map((partition, index) => <div key={`${index}-${partition.join("-")}`} className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-sm text-cyan-300">P{index} = {`{${partition.join(", ")}}`}</div>)}</div>;
}

function DfaMinimizationLab() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleMinimize = async () => {
    setIsRunning(true);
    setError("");
    try {
      setResult(await minimizeDfa(sampleDfa));
    } catch (minimizationError) {
      setError(minimizationError.message || "DFA minimization failed.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white"><section className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/learn" className="text-sm text-slate-500 hover:text-cyan-400">← Back to Learn</Link>
      <div className="mt-5 max-w-3xl"><span className="text-xs uppercase tracking-widest text-cyan-400">Minimization Lab</span><h1 className="mt-3 text-3xl font-bold">DFA Minimization</h1><p className="mt-3 text-sm leading-6 text-slate-400">Remove unreachable states, refine partitions, and construct an equivalent DFA with the fewest states.</p></div>
      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Example machine</h2><p className="mt-1 text-sm text-slate-500">States: a, b, c, dead · accepting state: c · dead is unreachable</p></div><button onClick={handleMinimize} disabled={isRunning} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50">{isRunning ? "Minimizing..." : "Run minimization"}</button></div>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}</section>
      {!result ? <p className="mt-6 rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">Run minimization to inspect each partition stage.</p> : <>
        <div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Partition history</h2><div className="mt-5 space-y-4">{result.stages.map((stage) => <article key={`${stage.stage}-${stage.partitions.length}`} className="border-l-2 border-cyan-500/40 pl-4"><p className="text-sm font-semibold capitalize text-cyan-300">{stage.stage.replace("_", " ")}</p><PartitionList partitions={stage.partitions} /><p className="mt-2 text-sm text-slate-500">{stage.explanation}</p></article>)}</div></section><section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Minimized DFA</h2><p className="mt-1 text-sm text-slate-500">Each minimized state represents one final stable partition.</p><div className="mt-5 space-y-2">{result.state_mapping.map((mapping) => <div key={mapping.minimized_state} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-3 text-sm"><span className="font-semibold text-cyan-300">{mapping.minimized_state}</span><span className="font-mono text-slate-300">{`{${mapping.original_states.join(", ")}}`}</span>{result.dfa.final_states.includes(mapping.minimized_state) && <span className="text-xs text-emerald-300">final</span>}</div>)}</div><p className="mt-5 text-sm text-slate-400">Start state: <span className="text-white">{result.dfa.start_state}</span> · States: <span className="text-white">{result.dfa.states.length}</span></p></section></div>
        <section className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Final transitions</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{Object.entries(result.dfa.transitions).map(([key, target]) => <div key={key} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 font-mono text-sm text-slate-300">δ({key.replace(",", ", ")}) = <span className="text-cyan-300">{target}</span></div>)}</div></section>
      </>}
    </section></main>
  );
}

export default DfaMinimizationLab;
