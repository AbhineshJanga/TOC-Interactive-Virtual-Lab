export const sampleNfa = {
  states: ["q0", "q1", "q2"],
  alphabet: ["0", "1"],
  transitions: {
    "q0,0": ["q0", "q1"],
    "q0,1": ["q0"],
    "q1,1": ["q2"],
    "q2,0": ["q2"],
    "q2,1": ["q2"],
  },
  start_state: "q0",
  final_states: ["q2"],
  use_epsilon_closure: false,
};
