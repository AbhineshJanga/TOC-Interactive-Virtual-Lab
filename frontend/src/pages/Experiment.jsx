import { Link } from "react-router";
import ModuleCard from "../components/common/ModuleCard";
import { experimentGroups } from "../data/experimentModules";

function Experiment() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Experiment Mode
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Build. Simulate. Analyze.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Create your own computational models, test custom inputs, observe
            every computational step, and understand the resulting behavior.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                01 — Build
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Define states, symbols and transitions.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-400">
                02 — Validate
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Check whether the computational model is valid.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-400">
                03 — Simulate
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Run custom input through the model step by step.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-400">
                04 — Analyze
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Understand the computation and its result.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-14">
          {experimentGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {group.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {group.description}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {group.models.map((model) => (
                  <ModuleCard
                    key={model.name}
                    {...model}
                    disabled={model.status !== "Available"}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 rounded-xl border border-blue-500/20 bg-blue-500/5 p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Current Laboratory
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              DFA Experiment
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              The DFA laboratory is the first fully interactive experiment.
              Build a finite automaton, test strings, visualize state
              transitions and inspect the execution trace.
            </p>

            <Link
              to="/experiment/dfa"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Open DFA Laboratory
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}

export default Experiment;