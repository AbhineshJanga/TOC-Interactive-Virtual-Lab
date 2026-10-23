import { useState } from "react";
import { Link } from "react-router";
import { deriveCfg, validateCfg } from "../../services/api";

const defaultVariables = "S, A, B";
const defaultTerminals = "a, b";
const defaultStartSymbol = "S";
const defaultProductions = "S -> AB\nA -> aA | a\nB -> bB | b";
const defaultInputString = "aabb";

function tokenizeSymbols(value, fieldName) {
  const symbols = value
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);
  if (symbols.length === 0) {
    throw new Error(`Enter at least one ${fieldName}.`);
  }
  if (new Set(symbols).size !== symbols.length) {
    throw new Error(`${fieldName[0].toUpperCase()}${fieldName.slice(1)} must be unique.`);
  }
  if (symbols.some((symbol) => /\s|,|\||->|→/.test(symbol))) {
    throw new Error(`${fieldName[0].toUpperCase()}${fieldName.slice(1)} cannot contain whitespace or grammar separators.`);
  }
  return symbols;
}

function tokenizeProduction(rhs, symbols, lineNumber) {
  const compactRhs = rhs.replace(/\s/g, "");
  if (compactRhs === "ε" || compactRhs === "e") return [];
  if (!compactRhs) {
    throw new Error(`Production line ${lineNumber} has an empty alternative; use ε or e for epsilon.`);
  }

  const orderedSymbols = [...symbols].sort((left, right) => right.length - left.length);
  const result = [];
  let offset = 0;
  while (offset < compactRhs.length) {
    const symbol = orderedSymbols.find((candidate) =>
      compactRhs.startsWith(candidate, offset)
    );
    if (!symbol) {
      throw new Error(
        `Production line ${lineNumber} contains an undeclared symbol near "${compactRhs.slice(offset)}".`
      );
    }
    result.push(symbol);
    offset += symbol.length;
  }
  return result;
}

function parseGrammar(variablesText, terminalsText, startSymbolText, productionsText) {
  const variables = tokenizeSymbols(variablesText, "variable");
  const terminals = terminalsText
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);
  if (new Set(terminals).size !== terminals.length) {
    throw new Error("Terminals must be unique.");
  }
  if (terminals.some((symbol) => /\s|,|\||->|→/.test(symbol))) {
    throw new Error("Terminals cannot contain whitespace or grammar separators.");
  }
  if (variables.some((variable) => terminals.includes(variable))) {
    throw new Error("Variables and terminals must not overlap.");
  }
  if (variables.includes("ε") || variables.includes("e") || terminals.includes("ε") || terminals.includes("e")) {
    throw new Error("Do not declare ε or e as a variable or terminal; use it only for epsilon productions.");
  }

  const startSymbol = startSymbolText.trim();
  if (!variables.includes(startSymbol)) {
    throw new Error("The start symbol must be one of the declared variables.");
  }

  const productions = {};
  const lines = productionsText.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    const arrowIndex = line.indexOf("->");
    const unicodeArrowIndex = line.indexOf("→");
    const splitIndex = arrowIndex >= 0 ? arrowIndex : unicodeArrowIndex;
    const arrowLength = arrowIndex >= 0 ? 2 : 1;
    if (splitIndex < 0 || line.indexOf("->", splitIndex + arrowLength) >= 0 || line.indexOf("→", splitIndex + arrowLength) >= 0) {
      throw new Error(`Production line ${index + 1} must use the form A -> replacement.`);
    }
    const left = line.slice(0, splitIndex).trim();
    if (!variables.includes(left)) {
      throw new Error(`Production line ${index + 1} has an undeclared left-hand variable "${left}".`);
    }
    const alternatives = line
      .slice(splitIndex + arrowLength)
      .split("|")
      .map((alternative) => tokenizeProduction(alternative, [...variables, ...terminals], index + 1));
    productions[left] = [...(productions[left] || []), ...alternatives];
  }

  for (const variable of variables) {
    if (!productions[variable]?.length) {
      throw new Error(`Add at least one production for variable "${variable}".`);
    }
  }

  return {
    variables,
    terminals,
    productions,
    start_symbol: startSymbol,
  };
}

function ParseTree({ node, variables }) {
  if (!node) return null;
  const isEpsilon = node.symbol === "ε";
  const isVariable = variables.includes(node.symbol);
  const nodeStyle = isEpsilon
    ? "border-amber-500/40 text-amber-300"
    : isVariable
      ? "border-cyan-500/50 text-cyan-300"
      : "border-slate-700 text-slate-300";

  return (
    <div className="flex flex-col items-center">
      <span
        className={`whitespace-nowrap rounded-lg border bg-slate-950 px-3 py-1 font-mono text-sm ${nodeStyle}`}
      >
        {node.symbol}
      </span>
      {node.children.length > 0 && (
        <>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-start gap-3 border-t border-slate-700 pt-3">
            {node.children.map((child, index) => (
              <ParseTree
                key={`${node.symbol}-${index}`}
                node={child}
                variables={variables}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GrammarField({
  label,
  value,
  onChange,
  multiline = false,
  rows,
  disabled = false,
}) {
  const sharedClassName =
    "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  return (
    <label className="block text-sm text-slate-300">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          disabled={disabled}
          className={`${sharedClassName} resize-y disabled:opacity-50`}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${sharedClassName} disabled:opacity-50`}
        />
      )}
    </label>
  );
}

function CfgLab() {
  const [variablesText, setVariablesText] = useState(defaultVariables);
  const [terminalsText, setTerminalsText] = useState(defaultTerminals);
  const [startSymbolText, setStartSymbolText] = useState(defaultStartSymbol);
  const [productionsText, setProductionsText] = useState(defaultProductions);
  const [inputString, setInputString] = useState(defaultInputString);
  const [strategy, setStrategy] = useState("leftmost");
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [grammarStatus, setGrammarStatus] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedVariables, setValidatedVariables] = useState([]);

  const clearDerivedResult = () => {
    setResult(null);
    setCurrentStep(0);
    setError("");
    setGrammarStatus("");
  };

  const readGrammar = () =>
    parseGrammar(variablesText, terminalsText, startSymbolText, productionsText);

  const handleValidate = async () => {
    setIsValidating(true);
    setError("");
    setGrammarStatus("");
    try {
      const grammar = readGrammar();
      const validation = await validateCfg(grammar);
      if (!validation.valid) {
        setGrammarStatus(validation.errors.join(" "));
        setValidatedVariables([]);
        return;
      }
      setValidatedVariables(grammar.variables);
      setGrammarStatus("Grammar is valid.");
    } catch (validationError) {
      setValidatedVariables([]);
      setGrammarStatus(
        validationError.message || "Unable to validate this grammar."
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleDerive = async () => {
    setIsRunning(true);
    setError("");
    setGrammarStatus("");
    setResult(null);
    setCurrentStep(0);
    try {
      const grammar = readGrammar();
      const validation = await validateCfg(grammar);
      if (!validation.valid) {
        setValidatedVariables([]);
        setGrammarStatus(validation.errors.join(" "));
        return;
      }
      setValidatedVariables(grammar.variables);
      if (inputString.trim() !== inputString) {
        setError("Input strings cannot start or end with whitespace.");
        return;
      }
      const derivation = await deriveCfg(grammar, inputString, strategy);
      setResult(derivation);
      if (!derivation.accepted) {
        setError(derivation.error || "This string cannot be derived from the grammar.");
      }
    } catch (deriveError) {
      setValidatedVariables([]);
      setError(deriveError.message || "CFG derivation failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const updateField = (setter) => (event) => {
    setter(event.target.value);
    clearDerivedResult();
  };
  const derivation = result?.derivation || [];
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/learn" className="text-sm text-slate-500 hover:text-cyan-400">
          ← Back to Learn
        </Link>
        <div className="mt-5 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-cyan-400">
            Grammar Lab
          </span>
          <h1 className="mt-3 text-3xl font-bold">
            Context-Free Grammar Derivation
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Edit a grammar, validate its productions, and inspect leftmost or
            rightmost derivations with their parse trees.
          </p>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.5fr)]">
          <aside className="h-fit rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Grammar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Separate symbols with commas. Use ε or e for an empty production.
            </p>
            <div className="mt-5 space-y-4">
              <GrammarField
                label="Variables / non-terminals"
                value={variablesText}
                onChange={updateField(setVariablesText)}
                disabled={isRunning || isValidating}
              />
              <GrammarField
                label="Terminals"
                value={terminalsText}
                onChange={updateField(setTerminalsText)}
                disabled={isRunning || isValidating}
              />
              <GrammarField
                label="Start symbol"
                value={startSymbolText}
                onChange={updateField(setStartSymbolText)}
                disabled={isRunning || isValidating}
              />
              <GrammarField
                label="Productions"
                value={productionsText}
                onChange={updateField(setProductionsText)}
                multiline
                rows={6}
                disabled={isRunning || isValidating}
              />
              <GrammarField
                label="Input string"
                value={inputString}
                onChange={updateField(setInputString)}
                disabled={isRunning || isValidating}
              />
            </div>

            <button
              type="button"
              onClick={handleValidate}
              disabled={isValidating || isRunning}
              className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:bg-slate-700 disabled:opacity-50"
            >
              {isValidating ? "Validating..." : "Validate Grammar"}
            </button>
            {grammarStatus && (
              <p
                role={grammarStatus === "Grammar is valid." ? "status" : "alert"}
                className={`mt-3 rounded-lg p-3 text-sm ${
                  grammarStatus === "Grammar is valid."
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                {grammarStatus}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              {["leftmost", "rightmost"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={isRunning || isValidating}
                  onClick={() => {
                    setStrategy(mode);
                    clearDerivedResult();
                  }}
                  className={`rounded-lg border px-2 py-2 text-xs capitalize transition ${
                    strategy === mode
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  } disabled:opacity-50`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleDerive}
              disabled={isRunning || isValidating}
              className="mt-3 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {isRunning ? "Deriving..." : "Derive String"}
            </button>
          </aside>

          <div className="min-w-0 space-y-5">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {strategy === "leftmost" ? "Leftmost" : "Rightmost"} derivation
                </h2>
                {result && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      result.accepted
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {result.accepted ? "GENERATED" : "NOT GENERATED"}
                  </span>
                )}
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
              {!result ? (
                <p className="mt-8 text-sm text-slate-500">
                  Validate the grammar or derive a string to inspect each sentential form.
                </p>
              ) : !result.accepted ? (
                <p className="mt-5 text-sm text-slate-400">
                  No derivation was found for the current input. Check that the
                  input uses declared terminals and can be produced by the rules.
                </p>
              ) : (
                <>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">
                      Step {currentStep + 1} of {derivation.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                        disabled={currentStep === 0}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500 disabled:opacity-40"
                      >
                        Previous Step
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(0)}
                        disabled={currentStep === 0}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500 disabled:opacity-40"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep((step) =>
                            Math.min(derivation.length - 1, step + 1)
                          )
                        }
                        disabled={currentStep >= derivation.length - 1}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500 disabled:opacity-40"
                      >
                        Next Step
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                    {derivation.map((form, index) => {
                      const expansion = result.expansions[index];
                      return (
                        <div
                          key={`step-${index}`}
                          className={`flex items-center gap-3 rounded-lg border p-3 ${
                            currentStep === index
                              ? "border-cyan-500/60 bg-cyan-500/5"
                              : "border-slate-800 bg-slate-950/60"
                          }`}
                        >
                          <span className="w-10 shrink-0 text-xs text-slate-500">
                            {index}
                          </span>
                          <span className="break-all font-mono text-cyan-300">
                            {form.length === 0 ? (
                              "ε"
                            ) : (
                              form.map((symbol, symbolIndex) =>
                                expansion?.position === symbolIndex ? (
                                  <span
                                    key={`${index}-${symbolIndex}`}
                                    className="rounded bg-amber-400/15 px-0.5 text-amber-200 ring-1 ring-amber-400/40"
                                    title={`${strategy} variable expanded next`}
                                  >
                                    {symbol}
                                  </span>
                                ) : (
                                  <span key={`${index}-${symbolIndex}`}>
                                    {symbol}
                                  </span>
                                )
                              )
                            )}
                          </span>
                          {expansion && (
                            <span className="ml-auto shrink-0 text-xs text-slate-500">
                              expand {expansion.variable}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {result.parse_tree && (
                    <div className="mt-8 overflow-x-auto border-t border-slate-800 pt-6">
                      <h3 className="mb-6 text-sm font-semibold text-slate-300">
                        Parse tree
                      </h3>
                      <div className="flex min-w-max justify-center px-3 pb-4">
                        <ParseTree
                          node={result.parse_tree}
                          variables={validatedVariables}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CfgLab;
