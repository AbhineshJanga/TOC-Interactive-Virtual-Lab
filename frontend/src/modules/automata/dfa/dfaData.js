export const initialDfa = {
  states: [
    {
      id: "q0",
      label: "q0",
      x: 150,
      y: 220,
    },
    {
      id: "q1",
      label: "q1",
      x: 400,
      y: 220,
    },
  ],

  alphabet: ["0", "1"],

  transitions: [
    {
      id: "q0-0-q1",
      source: "q0",
      target: "q1",
      symbol: "0",
    },
    {
      id: "q0-1-q0",
      source: "q0",
      target: "q0",
      symbol: "1",
    },
    {
      id: "q1-0-q0",
      source: "q1",
      target: "q0",
      symbol: "0",
    },
    {
      id: "q1-1-q1",
      source: "q1",
      target: "q1",
      symbol: "1",
    },
  ],

  startState: "q0",

  finalStates: ["q1"],
};

export const initialSimulation = {
  input: "",
  steps: [],
  currentStep: -1,
  result: null,
};