const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend health check failed");
  }

  return response.json();
}

export async function validateDfa(dfa) {
    const response = await fetch(`${API_BASE_URL}/api/dfa/validate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dfa),
    });

    if (!response.ok) {
        throw new Error("DFA validation failed");
    }

    return response.json();
}

export async function simulateDFA(dfa, inputString) {
  const response = await fetch(`${API_BASE_URL}/api/dfa/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dfa,
      input_string: inputString,
    }),
  });

  if (!response.ok) {
    throw new Error("DFA simulation request failed");
  }

  return response.json();
}