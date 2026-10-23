import { useState } from "react";
import { Link } from "react-router";
import { analyzePumpingLemma } from "../../services/api";

const initialForm = {
  string: "aabb",
  pumping_length: "3",
  x: "a",
  y: "a",
  z: "bb",
  language: "anbn",
};

const guidedSteps = [
  "Understand",
  "Choose decomposition",
  "Verify conditions",
  "Pump the string",
  "Interpret the result",
];

const supportedLanguages = [
  { id: "anbn", label: "L = {aⁿbⁿ | n ≥ 1} (ε excluded)" },
  { id: "balanced_parentheses", label: "Balanced parentheses" },
];

function Condition({ valid, children }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className={valid ? "text-emerald-400" : "text-amber-300"}>
        {valid ? "✓" : "•"}
      </span>
      <span className="text-slate-300">{children}</span>
    </li>
  );
}

function PumpingLemmaLab() {
  const [form, setForm] = useState(initialForm);
  const [pumpValuesText, setPumpValuesText] = useState("0, 1, 2, 3");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setResult(null);
    setError("");
  };

  const exponentValues = pumpValuesText
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const parsedExponents = exponentValues.map((value) => Number(value));
  const exponentsValid =
    exponentValues.length > 0 &&
    parsedExponents.every((value) => Number.isSafeInteger(value) && value >= 0);

  const reconstructs = form.x + form.y + form.z === form.string;
  const pumpingLength = Number(form.pumping_length);
  const validPumpingLength = Number.isInteger(pumpingLength) && pumpingLength >= 1;
  const xyLength = form.x.length + form.y.length;
  const xyLengthValid = validPumpingLength && xyLength <= pumpingLength;
  const yNonempty = form.y.length > 0;
  const stringLongEnough =
    validPumpingLength && form.string.length >= pumpingLength;

  const handleAnalyze = async () => {
    setIsRunning(true);
    setError("");
    setResult(null);
    try {
      if (!validPumpingLength) {
        setError("Pumping length p must be a whole number greater than or equal to 1.");
        return;
      }
      if (!exponentsValid) {
        setError("Enter one or more comma-separated, non-negative whole-number exponents (for example: 0, 1, 2, 3, 10).");
        return;
      }
      setResult(
        await analyzePumpingLemma({
          ...form,
          pumping_length: pumpingLength,
          pump_values: [...new Set(parsedExponents)],
        }),
      );
    } catch (analysisError) {
      setError(
        analysisError.message || "Unable to connect to the TOC algorithm engine.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/learn"
          className="text-sm text-slate-500 transition hover:text-cyan-400"
        >
          ← Back to Learn
        </Link>
        <header className="mt-5 max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-cyan-400">
            Learn · Language Properties
          </span>
          <h1 className="mt-3 text-3xl font-bold">Pumping Lemma Explorer</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The pumping lemma describes a property every regular language must
            have. This explorer lets you test a chosen split and visualize
            what happens when its middle segment is repeated.
          </p>
        </header>

        <section
          aria-labelledby="lemma-guide-title"
          className="mt-7 rounded-xl border border-slate-800 bg-slate-900/60 p-5"
        >
          <h2 id="lemma-guide-title" className="text-lg font-semibold">
            The lemma, in brief
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            For a regular language there is a pumping length p such that any
            sufficiently long string s in the language can be split as
            s = xyz. The prefix x stays fixed, y is the part we pump, and z is
            the remaining suffix.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm">
              <span className="font-mono font-bold text-cyan-300">|xy| ≤ p</span>
              <p className="mt-1 text-slate-400">
                x and y are within the first p symbols.
              </p>
            </li>
            <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm">
              <span className="font-mono font-bold text-emerald-300">|y| &gt; 0</span>
              <p className="mt-1 text-slate-400">
                The segment being pumped cannot be empty.
              </p>
            </li>
            <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm">
              <span className="font-mono font-bold text-violet-300">
                xy<sup>i</sup>z ∈ L
              </span>
              <p className="mt-1 text-slate-400">
                For every i ≥ 0, the pumped string must remain in L.
              </p>
            </li>
          </ul>
          <div className="mt-5 grid gap-2 sm:grid-cols-5">
            {guidedSteps.map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 px-3 py-2"
              >
                <span className="text-xs font-semibold text-cyan-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-1 text-xs text-slate-300">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-sm leading-6 text-amber-200">
            This is an illustrative exploration: testing one split and finitely
            many exponents does not prove non-regularity. A proof must reason
            about every decomposition allowed by the lemma.
          </p>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Choose a decomposition</h2>
            <label className="mt-4 block text-sm text-slate-300">
              Supported language
              <select
                aria-label="Language"
                value={form.language}
                onChange={(event) => update("language", event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white"
              >
                {supportedLanguages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm text-slate-300">
              Original string s
              <input
                aria-label="Original string"
                value={form.string}
                onChange={(event) => update("string", event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white"
              />
            </label>
            <label className="mt-4 block text-sm text-slate-300">
              Pumping length p
              <input
                aria-label="Pumping length"
                min="1"
                type="number"
                value={form.pumping_length}
                onChange={(event) => update("pumping_length", event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white"
              />
            </label>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["x", "x · fixed prefix"],
                ["y", "y · pump segment"],
                ["z", "z · suffix"],
              ].map(([field, label]) => (
                <label key={field} className="text-sm text-slate-300">
                  {label}
                  <input
                    aria-label={label}
                    value={form[field]}
                    onChange={(event) => update(field, event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2.5 font-mono text-white"
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-sm text-slate-300">
              Pumping exponents i (comma-separated)
              <input
                aria-label="Pumping exponents"
                value={pumpValuesText}
                onChange={(event) => {
                  setPumpValuesText(event.target.value);
                  setResult(null);
                  setError("");
                }}
                placeholder="0, 1, 2, 3, 10"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white"
              />
            </label>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isRunning}
              className="mt-5 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-wait disabled:opacity-50"
            >
              {isRunning ? "Analyzing..." : "Verify and pump"}
            </button>
            {error && (
              <p role="alert" className="mt-3 text-sm leading-5 text-red-300">
                {error}
              </p>
            )}
          </aside>

          <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Decomposition and conditions</h2>
            <p className="mt-1 text-sm text-slate-400">
              The colored split updates as you edit x, y, z, or s.
            </p>
            <div
              aria-label="String split into x, y, and z"
              className="mt-5 flex min-h-16 flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xl"
            >
              <span className="text-cyan-300" title="x: fixed prefix">
                {form.x || "ε"}
              </span>
              <span className="text-emerald-300" title="y: pumped segment">
                {form.y || "ε"}
              </span>
              <span className="text-violet-300" title="z: suffix">
                {form.z || "ε"}
              </span>
              <span className="ml-auto text-xs text-slate-500">
                |s| = {form.string.length}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <span className="text-cyan-300">x: |x| = {form.x.length}</span>
              <span className="text-emerald-300">y: |y| = {form.y.length}</span>
              <span className="text-violet-300">z: |z| = {form.z.length}</span>
              <span className="text-slate-400">
                |xy| = {xyLength}; p = {validPumpingLength ? pumpingLength : "?"}
              </span>
            </div>
            <ul className="mt-5 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <Condition valid={reconstructs}>
                s = xyz {reconstructs ? "— the segments reconstruct the input." : "— x + y + z does not equal s."}
              </Condition>
              <Condition valid={stringLongEnough}>
                |s| ≥ p {stringLongEnough ? "— the string is long enough to apply the lemma." : "— the string must be at least p symbols long."}
              </Condition>
              <Condition valid={xyLengthValid}>
                |xy| ≤ p {xyLengthValid ? "— x and y fit within the first p symbols." : "— choose x and y so their combined length is at most p."}
              </Condition>
              <Condition valid={yNonempty}>
                |y| &gt; 0 {yNonempty ? "— the pumped segment is non-empty." : "— choose a non-empty y segment."}
              </Condition>
            </ul>

            {result && (
              <>
                <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className={`font-semibold ${result.valid_decomposition ? "text-emerald-400" : "text-red-400"}`}>
                    {result.valid_decomposition ? "Valid decomposition" : "Invalid decomposition"}
                  </p>
                  <p className="mt-2 font-mono text-sm">
                    s = <span className="text-cyan-300">{result.decomposition.x || "ε"}</span>
                    <span className="text-emerald-300">{result.decomposition.y || "ε"}</span>
                    <span className="text-violet-300">{result.decomposition.z || "ε"}</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{result.explanation}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Original string membership:{" "}
                    <span className={result.original_in_language ? "text-emerald-300" : "text-amber-300"}>
                      {result.original_in_language ? "in the selected language" : "not in the selected language"}
                    </span>
                  </p>
                  {result.errors.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-red-300">
                      {result.errors.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>
                {result.valid_decomposition && (
                  <>
                    <h3 className="mt-6 text-sm font-semibold text-slate-300">
                      Pumped strings x·y<sup>i</sup>·z
                    </h3>
                    {result.pumped.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        Enter at least one non-negative exponent to see pumped strings.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {result.pumped.map((item) => (
                          <div
                            key={item.i}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                          >
                            <span className="break-all font-mono text-cyan-300">
                              xy<sup>{item.i}</sup>z = {item.string || "ε"}
                            </span>
                            <span className={item.in_language ? "text-emerald-400" : "text-red-400"}>
                              {item.in_language ? "in language" : "not in language"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
          <h2 className="text-lg font-semibold text-violet-200">
            Worked proof strategy: L = {"{aⁿbⁿ | n ≥ 1}"}
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
            <li>
              Assume for contradiction that L is regular, with pumping length p.
            </li>
            <li>
              Choose s = a<sup>p</sup>b<sup>p</sup>, which is in L and has length
              at least p.
            </li>
            <li>
              For any permitted split s = xyz with |xy| ≤ p and |y| &gt; 0,
              x and y lie entirely in the first block of a&apos;s. Thus y = a
              <sup>k</sup> for some k ≥ 1.
            </li>
            <li>
              Pump down with i = 0. The result a<sup>p-k</sup>b<sup>p</sup>
              is not in L: if p &gt; k the counts differ, and if p = k the
              result is b<sup>p</sup>, which is also outside L.
            </li>
          </ol>
          <p className="mt-3 text-sm leading-6 text-violet-200">
            This argument works for every decomposition satisfying the lemma&apos;s
            first two conditions; showing only one split fails is not enough.
            That contradiction establishes that L is not regular.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Supported membership checks in this explorer are limited to
            aⁿbⁿ (n ≥ 1, ε excluded) and balanced parentheses.
          </p>
        </section>
      </section>
    </main>
  );
}

export default PumpingLemmaLab;
