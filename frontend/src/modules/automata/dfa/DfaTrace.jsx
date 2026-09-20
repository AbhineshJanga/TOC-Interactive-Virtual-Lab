function DfaTrace({ trace = [] }) {
  const hasTrace = trace.length > 0;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Execution Trace
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Step-by-step DFA computation.
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs ${hasTrace
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-slate-700 text-slate-500"
            }`}
        >
          {hasTrace ? `${trace.length} Steps` : "No simulation"}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Current State</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Next State</th>
              <th className="px-4 py-3">Explanation</th>
            </tr>
          </thead>

          <tbody>
            {hasTrace ? (
              trace.map((step) => (
                <tr
                  key={step.step}
                  className="border-b border-slate-800/70 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-blue-400">
                    {step.step}
                  </td>

                  <td className="px-4 py-3 font-medium text-white">
                    {step.current_state}
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {step.symbol ?? "—"}
                  </td>

                  <td className="px-4 py-3 font-medium text-emerald-400">
                    {step.next_state}
                  </td>

                  <td className="px-4 py-3 text-slate-400">
                    {step.explanation}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-10 text-center text-slate-600"
                >
                  Run a simulation to see the computation trace.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DfaTrace;