from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.dfa import router as dfa_router


app = FastAPI(
    title="TOC Interactive Virtual Lab API",
    description="Backend API for the Theory of Computation Interactive Virtual Lab",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dfa_router)


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