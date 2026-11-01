# TOC Interactive Virtual Lab with Intelligent Analysis

An interactive virtual lab for exploring Theory of Computation through model building, simulation, visualization, and step-by-step analysis.

## Features

- **DFA, NFA & ε-NFA:** Build automata and simulate input strings.
- **NFA to DFA Conversion:** Convert nondeterministic automata using subset construction.
- **DFA Minimization:** Minimize deterministic finite automata.
- **Regular Expressions:** Convert regular expressions into finite automata.
- **Context-Free Grammars:** Explore grammar derivations and parse trees.
- **Pushdown Automata:** Visualize transitions and stack operations.
- **Turing Machines:** Simulate tape operations, head movement, and state transitions.
- **Pumping Lemma:** Explore pumping-lemma concepts and string decompositions.
- **Chomsky Hierarchy:** Classify grammars based on their production rules.
- **Learn Mode:** Explore predefined examples.
- **Experiment Mode:** Build and test custom computational models.
- **Intelligent Analysis:** Understand computation behavior, validation, and results.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Visualization:** React Flow, SVG, Framer Motion
- **Backend:** Python, FastAPI
- **Version Control:** Git and GitHub

## Getting Started

### 1. Fork the Repository

Click the **Fork** button at the top of this repository to create your own copy.

### 2. Clone 

Clone the original repository directly:

```bash
git clone https://github.com/AbhineshJanga/TOC-Interactive-Virtual-Lab.git
cd TOC-Interactive-Virtual-Lab
```

### 3. Start the Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows — PowerShell**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows — Git Bash**
```bash
source .venv/Scripts/activate
```

Install dependencies and start the server:

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000`

API documentation: `http://127.0.0.1:8000/docs`

### 4. Start the Frontend

Open a second terminal in the directory containing the frontend's `package.json`:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

Keep both the backend and frontend servers running while using the application.

## Input Conventions

- DFA, NFA, and ε-NFA use single-character input symbols.
- Epsilon productions are represented by an empty right-hand-side list (`[]`).
- For Chomsky classification, `S → ε` is treated as the Type 1/Type 3 exception only when `S` does not appear on any production right-hand side. Therefore, `S → aSb | ε` remains Type 2.
