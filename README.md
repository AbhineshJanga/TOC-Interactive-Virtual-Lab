# TOC Interactive Virtual Lab with Intelligent Analysis

An interactive Theory of Computation virtual laboratory for learning, building, simulating, visualizing, and analyzing computational models.

## Project Modes

- Learn — Pre-built TOC examples with guided explanations
- Experiment — Build and test custom computational models

## Planned Modules

- DFA / NFA / ε-NFA
- Regular Expression → NFA → DFA → Minimization
- Context-Free Grammars and Parse Trees
- Pushdown Automata
- Turing Machines
- Pumping Lemma
- Chomsky Hierarchy
- Intelligent Analysis

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Flow
- SVG
- Framer Motion

### Backend
- Python
- FastAPI
- Custom TOC Algorithm Engine

### Database
- MongoDB

### Development
- VS Code
- Git
- GitHub

## Input and Grammar Conventions

- DFA, NFA, and ε-NFA simulations use single-character input symbols. Validation rejects multi-character alphabet symbols rather than splitting them inconsistently.
- Epsilon productions are represented by an empty right-hand-side symbol list (`[]`). For Chomsky classification, `S → ε` is treated as the Type 1/Type 3 exception only when the start symbol `S` does not appear on any production right-hand side. Thus, `S → aSb | ε` remains Type 2.