export const learnSections = [
  {
    title: "Finite Automata",
    description:
      "Understand finite-state machines through visual examples and step-by-step simulations.",
    modules: [
      {
        name: "DFA",
        description: "Deterministic Finite Automata",
        path: "/learn/dfa",
        status: "Core",
      },
      {
        name: "NFA",
        description: "Nondeterministic Finite Automata",
        path: "/learn/nfa",
        status: "Core",
      },
      {
        name: "ε-NFA",
        description: "Epsilon-Nondeterministic Finite Automata",
        path: "/learn/enfa",
        status: "Core",
      },
    ],
  },

  {
    title: "Regular Languages",
    description:
      "Follow the transformation of regular expressions into equivalent automata.",
    modules: [
      {
        name: "Regex → NFA",
        description: "Thompson construction",
        path: "/learn/regex",
        status: "Core",
      },
      {
        name: "NFA → DFA",
        description: "Subset construction",
        path: "/learn/nfa-to-dfa",
        status: "Core",
      },
      {
        name: "DFA Minimization",
        description: "Reduce equivalent states",
        path: "/learn/minimization",
        status: "Core",
      },
    ],
  },

  {
    title: "Context-Free Languages",
    description:
      "Explore grammars, derivations and parse trees through guided examples.",
    modules: [
      {
        name: "CFG",
        description: "Context-Free Grammars",
        path: "/learn/cfg",
        status: "Core",
      },
      {
        name: "Derivations",
        description: "Step-by-step string derivation",
        path: "/learn/derivations",
        status: "Core",
      },
      {
        name: "Parse Trees",
        description: "Visual grammar structure",
        path: "/learn/parse-trees",
        status: "Core",
      },
    ],
  },

  {
    title: "Computational Models",
    description:
      "Study machines that extend the capabilities of finite automata.",
    modules: [
      {
        name: "PDA",
        description: "Pushdown Automata and stack operations",
        path: "/learn/pda",
        status: "Core",
      },
      {
        name: "Turing Machine",
        description: "Tape-based computation",
        path: "/learn/turing-machine",
        status: "Core",
      },
    ],
  },

  {
    title: "Theory & Language Properties",
    description:
      "Explore fundamental theoretical concepts behind formal languages.",
    modules: [
      {
        name: "Pumping Lemma",
        description: "Visual language-property demonstrations",
        path: "/learn/pumping-lemma",
        status: "Theory",
      },
      {
        name: "Chomsky Hierarchy",
        description: "Classification of formal grammars",
        path: "/learn/chomsky-hierarchy",
        status: "Theory",
      },
    ],
  },
];