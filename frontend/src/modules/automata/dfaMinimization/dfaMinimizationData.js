export const sampleDfa = {
  states: ["a", "b", "c", "dead"],
  alphabet: ["0", "1"],
  transitions: {
    "a,0": "b",
    "a,1": "c",
    "b,0": "a",
    "b,1": "c",
    "c,0": "c",
    "c,1": "c",
    "dead,0": "dead",
    "dead,1": "dead",
  },
  start_state: "a",
  final_states: ["c"],
};
