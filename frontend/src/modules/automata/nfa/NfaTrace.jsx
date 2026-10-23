function NfaTrace({ trace = [], result }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Execution trace</h2>{result && <span className={result.accepted ? "text-emerald-400" : "text-red-400"}>{result.accepted ? "ACCEPTED" : "REJECTED"}</span>}</div>
      {result?.error && <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{result.error}</p>}
      <div className="mt-4 space-y-2">
        {trace.length === 0 ? <p className="text-sm text-slate-500">Run a simulation to see every reachable state set.</p> : trace.map((step) => (
          <div key={step.step} className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm sm:grid-cols-[60px_100px_1fr]">
            <span className="text-slate-500">Step {step.step}</span><span className="text-cyan-300">{step.symbol ?? "start"}</span><span className="text-slate-300">{step.explanation}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NfaTrace;
