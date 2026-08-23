import { Link } from "react-router";

import { homeModules } from "../data/homeModules";

function Home() {
    return (
        <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">

            {/* Hero */}
            <section className="mx-auto max-w-7xl px-6 pb-20 pt-24">
                <div className="max-w-4xl">

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        Interactive Theory of Computation Laboratory
                    </div>

                    <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                        Learn how computation
                        <span className="block text-blue-400">
                            actually works.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                        Build computational models, simulate their behavior, visualize
                        every transition, and understand why a computation produces its
                        result.
                    </p>

                    <div className="mt-9 flex flex-wrap gap-4">
                        <Link
                            to="/learn"
                            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
                        >
                            Start Learning
                        </Link>

                        <Link
                            to="/experiment"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                        >
                            Open Experiment Lab
                        </Link>
                    </div>
                </div>
            </section>

            {/* Core idea */}
            <section className="border-y border-slate-800 bg-slate-900/40">
                <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                            01
                        </p>
                        <h2 className="mt-2 text-xl font-semibold">
                            Learn
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Study pre-built examples and understand TOC concepts through
                            visual explanations.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                            02
                        </p>
                        <h2 className="mt-2 text-xl font-semibold">
                            Experiment
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Build your own computational models and test them with custom
                            inputs.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                            03
                        </p>
                        <h2 className="mt-2 text-xl font-semibold">
                            Analyze
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            See execution traces and intelligent analysis instead of only
                            Accepted or Rejected.
                        </p>
                    </div>

                </div>
            </section>

            {/* Modules */}
            <section className="mx-auto max-w-7xl px-6 py-20">

                <div className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                        Laboratory Modules
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        Explore Theory of Computation
                    </h2>

                    <p className="mt-3 max-w-2xl text-slate-400">
                        Interactive modules covering the major computational models and
                        concepts in the course.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                    {homeModules.map((module) => (
                        <div
                            key={module.title}
                            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900"
                        >
                            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                                →
                            </div>

                            <h3 className="text-lg font-semibold">
                                {module.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                {module.description}
                            </p>

                            <p className="mt-5 text-xs font-medium text-slate-500">
                                {module.topics}
                            </p>
                        </div>
                    ))}

                </div>
            </section>

            {/* Footer CTA */}
            <section className="border-t border-slate-800">
                <div className="mx-auto max-w-7xl px-6 py-16 text-center">

                    <h2 className="text-3xl font-bold">
                        Ready to experiment?
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-slate-400">
                        Create a computational model and watch the computation happen
                        step by step.
                    </p>

                    <Link
                        to="/experiment"
                        className="mt-7 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                    >
                        Enter Experiment Lab
                    </Link>

                </div>
            </section>

        </main>
    );
}

export default Home;