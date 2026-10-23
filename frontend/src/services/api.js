const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function safeErrorText(value) {
  if (typeof value !== "string") return "";
  const message = value.trim();
  if (
    /traceback \(most recent call last\)|^\s*File ".*", line \d+|^\s+at .+/im.test(
      message,
    )
  ) {
    return "";
  }
  return message;
}

function formatErrorDetail(detail) {
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return safeErrorText(item);
        const message = item?.msg;
        if (!message) return "";
        const location = Array.isArray(item.loc)
          ? item.loc.filter((part) => part !== "body").join(".")
          : "";
        return safeErrorText(location ? `${location}: ${message}` : message);
      })
      .filter(Boolean)
      .join(" ");
  }
  return safeErrorText(detail);
}

async function requestJson(url, options, fallbackMessage) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new Error(
      "Unable to connect to the TOC algorithm engine. Check that the backend is running.",
      { cause: error },
    );
  }

  if (!response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    const detail = formatErrorDetail(payload?.detail);
    const statusMessage =
      response.status >= 500
        ? `The algorithm service returned an internal error (HTTP ${response.status}).`
        : `${fallbackMessage} (HTTP ${response.status}).`;
    throw new Error(detail || statusMessage);
  }

  return response.json();
}

function postJson(path, payload, fallbackMessage) {
  return requestJson(
    `${API_BASE_URL}${path}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    fallbackMessage,
  );
}

export function checkBackendHealth() {
  return requestJson(
    `${API_BASE_URL}/api/health`,
    undefined,
    "Backend health check failed",
  );
}

export function validateDfa(dfa) {
  return postJson("/api/dfa/validate", dfa, "DFA validation failed");
}

export function simulateDFA(dfa, inputString) {
  return postJson(
    "/api/dfa/simulate",
    { dfa, input_string: inputString },
    "DFA simulation request failed",
  );
}

export function validateNfa(nfa) {
  return postJson("/api/nfa/validate", nfa, "NFA validation failed");
}

export function simulateNFA(nfa, inputString) {
  return postJson(
    "/api/nfa/simulate",
    { nfa, input_string: inputString },
    "NFA simulation request failed",
  );
}

export function validateEpsilonNfa(epsilonNfa) {
  return postJson(
    "/api/epsilon-nfa/validate",
    epsilonNfa,
    "Epsilon-NFA validation failed",
  );
}

export function simulateEpsilonNfa(epsilonNfa, inputString) {
  return postJson(
    "/api/epsilon-nfa/simulate",
    { epsilon_nfa: epsilonNfa, input_string: inputString },
    "Epsilon-NFA simulation request failed",
  );
}

export function convertNfaToDfa(nfa) {
  return postJson(
    "/api/subset-construction/convert",
    nfa,
    "Subset construction request failed",
  );
}

export function minimizeDfa(dfa) {
  return postJson("/api/dfa/minimize", dfa, "DFA minimization request failed");
}

export function deriveCfg(grammar, inputString, strategy = "leftmost") {
  return postJson(
    "/api/cfg/derive",
    { ...grammar, input_string: inputString, strategy },
    "CFG derivation request failed",
  );
}

export function validateCfg(grammar) {
  return postJson("/api/cfg/validate", grammar, "CFG validation failed");
}

export function simulatePda(pda, inputString) {
  return postJson(
    "/api/pda/simulate",
    { pda, input_string: inputString },
    "PDA simulation request failed",
  );
}

export function validatePda(pda) {
  return postJson("/api/pda/validate", pda, "PDA validation failed");
}

export function simulateTuringMachine(machine, inputString, maxSteps = 1000) {
  return postJson(
    "/api/turing-machine/simulate",
    { machine, input_string: inputString, max_steps: maxSteps },
    "Turing machine simulation request failed",
  );
}

export function validateTuringMachine(machine) {
  return postJson(
    "/api/turing-machine/validate",
    machine,
    "Turing machine validation failed",
  );
}

export function convertRegexToNfa(regex) {
  return postJson(
    "/api/regex/to-nfa",
    { regex },
    "Regular expression conversion failed",
  );
}

export function analyzePumpingLemma(payload) {
  return postJson(
    "/api/pumping-lemma/analyze",
    payload,
    "Pumping lemma analysis failed",
  );
}

export function classifyGrammar(grammar) {
  return postJson(
    "/api/chomsky-hierarchy/classify",
    grammar,
    "Grammar classification failed",
  );
}
