import { useState } from "react";
import { Link } from "react-router";
import { convertRegexToNfa } from "../../services/api";
import RegexNfaDiagram from "./RegexNfaDiagram";

function validateConversionResponse(response) {
  if (!response || typeof response !== "object") {
    throw new Error("The conversion service returned an invalid response.");
  }

  const { alphabet, final_states, postfix, start_state, states, transitions } =
    response;
  if (
    typeof response.regex !== "string" ||
    !Array.isArray(postfix) ||
    !postfix.every((token) => typeof token === "string") ||
    !Array.isArray(states) ||
    states.length === 0 ||
    !states.every((state) => typeof state === "string") ||
    new Set(states).size !== states.length ||
    !Array.isArray(alphabet) ||
    !alphabet.every((symbol) => typeof symbol === "string") ||
    typeof transitions !== "object" ||
    transitions === null ||
    Array.isArray(transitions) ||
    typeof start_state !== "string" ||
    !states.includes(start_state) ||
    !Array.isArray(final_states) ||
    final_states.length === 0 ||
    !final_states.every((state) => states.includes(state))
  ) {
    throw new Error("The conversion service returned an incomplete ε-NFA.");
  }

  for (const [key, targets] of Object.entries(transitions)) {
    const separator = key.indexOf(",");
    const source = key.slice(0, separator);
    if (
      separator < 0 ||
      !states.includes(source) ||
      !key.slice(separator + 1) ||
      !Array.isArray(targets) ||
      targets.length === 0 ||
      !targets.every((target) => states.includes(target))
    ) {
      throw new Error("The conversion service returned malformed transitions.");
    }
  }

  return response;
}

function getTransitionCount(transitions) {
  return Object.values(transitions).reduce(
    (count, targets) => count + targets.length,
    0
  );
}

function RegexLab() {
  const [regex, setRegex] = useState("a(b|c)*");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleConvert = async () => {
    if (isRunning) return;
    const expression = regex;
    setIsRunning(true);
    setError("");
    setResult(null);
    try {
      const response = await convertRegexToNfa(expression);
      setResult(validateConversionResponse(response));
    } catch (conversionError) {
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : "Regular expression conversion failed."
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/learn" className="text-sm text-slate-500 hover:text-cyan-400">
          ← Back to Learn
        </Link>
        <div className="mt-5 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-cyan-400">
            Regular Expression Lab
          </span>
          <h1 className="mt-3 text-3xl font-bold">Regex → ε-NFA</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Parse a regular expression and follow Thompson construction into
            an equivalent epsilon-NFA.
          </p>
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex-1 text-sm text-slate-300">
              Regular expression
              <input
                value={regex}
                onChange={(event) => setRegex(event.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white"
              />
            </label>
            <button
              type="button"
              onClick={handleConvert}
              disabled={isRunning}
              className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50"
            >
              {isRunning ? "Constructing..." : "Build ε-NFA"}
            </button>
          </div>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}
        </section>

        {!result ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
            Enter a regex and build the automaton.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-semibold">Parse</h2>
              <p className="mt-4 text-sm text-slate-400">Postfix notation</p>
              <p className="mt-2 break-words rounded-lg bg-slate-950 p-3 font-mono text-cyan-300">
                {result.postfix.join(" ")}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-slate-800 p-3">
                  <span className="text-slate-500">States</span>
                  <p className="mt-1 text-white">{result.states.length}</p>
                </div>
                <div className="rounded-lg border border-slate-800 p-3">
                  <span className="text-slate-500">Alphabet</span>
                  <p className="mt-1 break-words text-white">
                    {result.alphabet.join(", ") || "∅"}
                  </p>
                </div>
              </div>
            </section>

            <div className="space-y-5">
              <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h2 className="text-lg font-semibold">Generated ε-NFA</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Built from regular expression{" "}
                  <span className="font-mono text-slate-300">{result.regex}</span>
                </p>
                <div className="mt-4">
                  <RegexNfaDiagram result={result} />
                </div>
              </section>

              <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h2 className="text-lg font-semibold">Thompson ε-NFA</h2>
                <div className="mt-3 space-y-2 text-sm text-slate-400">
                  <p>
                    Start: <span className="font-mono text-cyan-300">{result.start_state}</span>
                  </p>
                  <p>
                    Final states:{" "}
                    <span className="font-mono text-blue-300">
                      {result.final_states.join(", ")}
                    </span>
                  </p>
                </div>
                <h3 className="mt-5 text-sm font-medium text-slate-300">
                  Transitions ({getTransitionCount(result.transitions)})
                </h3>
                <div className="mt-3 max-h-[min(55vh,520px)] space-y-2 overflow-y-auto pr-1">
                  {Object.entries(result.transitions).map(([key, targets]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 font-mono text-sm text-slate-300"
                    >
                      δ({key.replace(",", ", ")}) →{" "}
                      <span className="text-cyan-300">{targets.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default RegexLab;
