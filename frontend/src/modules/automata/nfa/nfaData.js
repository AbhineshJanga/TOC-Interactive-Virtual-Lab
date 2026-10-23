export const initialNfa = {
  states: [
    { id: "q0", label: "q0", x: 140, y: 220 },
    { id: "q1", label: "q1", x: 390, y: 120 },
    { id: "q2", label: "q2", x: 390, y: 320 },
  ],
  alphabet: ["0", "1"],
  transitions: [
    { id: "q0-0-q0", source: "q0", target: "q0", symbol: "0" },
    { id: "q0-0-q1", source: "q0", target: "q1", symbol: "0" },
    { id: "q1-1-q2", source: "q1", target: "q2", symbol: "1" },
  ],
  startState: "q0",
  finalStates: ["q2"],
};
