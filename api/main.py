from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import project, matchups

app = FastAPI(title="HR Projector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project.router, prefix="/project")
app.include_router(matchups.router, prefix="/matchups")

@app.get("/")
def root():
    return {"status": "ok", "message": "HR Projector API running"}

@app.get("/health")
def health():
    return {"status": "ok"}
