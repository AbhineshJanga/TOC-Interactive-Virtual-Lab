from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.dfa import router as dfa_router
from app.routes.nfa import router as nfa_router
from app.routes.epsilon_nfa import router as epsilon_nfa_router
from app.routes.subset_construction import router as subset_construction_router
from app.routes.dfa_minimization import router as dfa_minimization_router
from app.routes.cfg import router as cfg_router
from app.routes.pda import router as pda_router
from app.routes.turing_machine import router as turing_machine_router
from app.routes.regex import router as regex_router
from app.routes.pumping_lemma import router as pumping_lemma_router
from app.routes.chomsky_hierarchy import router as chomsky_hierarchy_router


app = FastAPI(
    title="TOC Interactive Virtual Lab API",
    description="Backend API for the Theory of Computation Interactive Virtual Lab",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dfa_router)
app.include_router(nfa_router)
app.include_router(epsilon_nfa_router)
app.include_router(subset_construction_router)
app.include_router(dfa_minimization_router)
app.include_router(cfg_router)
app.include_router(pda_router)
app.include_router(turing_machine_router)
app.include_router(regex_router)
app.include_router(pumping_lemma_router)
app.include_router(chomsky_hierarchy_router)


@app.get("/")
def root():
    return {
        "message": "TOC Interactive Virtual Lab API",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TOC Algorithm Engine",
    }