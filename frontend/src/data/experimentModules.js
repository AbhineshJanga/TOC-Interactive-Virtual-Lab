export const experimentGroups = [
  {
    title: "Finite Automata",
    description:
      "Construct finite automata, define transitions, and test input strings.",
    models: [
      {
        name: "DFA",
        description: "Build a deterministic finite automaton.",
        path: "/experiment/dfa",
        status: "Available",
      },
      {
        name: "NFA",
        description: "Build a nondeterministic finite automaton.",
        path: "/experiment/nfa",
        status: "Planned",
      },
      {
        name: "ε-NFA",
        description: "Experiment with epsilon transitions.",
        path: "/experiment/enfa",
        status: "Planned",
      },
    ],
  },

  {
    title: "Regular Expressions",
    description:
      "Explore transformations between regular expressions and finite automata.",
    models: [
      {
        name: "Regex",
        description:
          "Enter a regular expression and explore its automaton.",
        path: "/experiment/regex",
        status: "Planned",
      },
    ],
  },

  {
    title: "Context-Free Languages",
    description:
      "Create grammars and investigate derivations and parse structures.",
    models: [
      {
        name: "CFG",
        description:
          "Define productions and generate derivations.",
        path: "/experiment/cfg",
        status: "Planned",
      },
    ],
  },

  {
    title: "Advanced Computational Models",
    description:
      "Build machines with memory and observe their computational behavior.",
    models: [
      {
        name: "PDA",
        description:
          "Construct a pushdown automaton with a stack.",
        path: "/experiment/pda",
        status: "Planned",
      },
      {
        name: "Turing Machine",
        description:
          "Define states, transitions and tape operations.",
        path: "/experiment/turing-machine",
        status: "Planned",
      },
    ],
  },
];