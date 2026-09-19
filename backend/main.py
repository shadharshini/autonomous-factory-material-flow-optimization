from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
try:
    from .models import HealthResponse, OptimizationRequest, OptimizationResponse
    from .optimization import run_optimization
except ImportError:
    from models import HealthResponse, OptimizationRequest, OptimizationResponse
    from optimization import run_optimization

app = FastAPI(
    title="Autonomous Factory Material Flow Optimization API",
    description="Backend optimization engine API for AGV selection and A* route planning.",
    version="1.0.0"
)

# Enable CORS for frontend communication from localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins including localhost:8000, localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend operational readiness."""
    return HealthResponse(
        status="ok",
        message="Backend is running"
    )


@app.post("/api/optimize", response_model=OptimizationResponse, tags=["Optimization"])
async def optimize_task(request: OptimizationRequest):
    """
    Evaluates available AGVs via multi-criteria weighted scoring and computes
    the optimal travel route using the A* pathfinding algorithm.
    """
    if request.source == request.destination:
        raise HTTPException(
            status_code=400,
            detail="Source and Destination locations must be different."
        )

    try:
        response = run_optimization(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
