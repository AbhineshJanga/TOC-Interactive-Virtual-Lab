function DfaTrace() {
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

        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-500">
          No simulation
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
            <tr>
              <td
                colSpan="5"
                className="px-4 py-10 text-center text-slate-600"
              >
                Run a simulation to see the computation trace.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DfaTrace;