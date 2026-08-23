import { Link } from "react-router";
import ModuleCard from "../components/common/ModuleCard";
import { learnSections } from "../data/learnModules";

function Learn() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Learn Mode
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Explore Theory of Computation
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Learn through pre-built computational models, guided examples,
            visual state transitions and step-by-step execution traces.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                01 — Explore
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Start with a pre-built example instead of constructing the
                machine from scratch.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-400">
                02 — Simulate
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Execute an input string and observe how the computational
                model changes state step by step.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-400">
                03 — Understand
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                See why the computation produces its final result instead of
                only receiving Accepted or Rejected.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-14">
          {learnSections.map((section) => (
            <section key={section.title}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {section.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {section.description}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {section.modules.map((module) => (
                  <ModuleCard
                    key={module.name}
                    {...module}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
          <h2 className="text-2xl font-bold">
            Want to build your own model?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Switch to Experiment mode to create computational models, define
            transitions and test your own inputs.
          </p>

          <Link
            to="/experiment"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Enter Experiment Lab
          </Link>
        </div>

      </section>
    </main>
  );
}

export default Learn;