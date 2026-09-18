from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok", example="ok")
    message: str = Field(default="Backend is running", example="Backend is running")


class OptimizationRequest(BaseModel):
    source: str = Field(..., example="Storage Area A")
    destination: str = Field(..., example="Production Station 2")
    material_type: str = Field(..., example="Steel Parts")
    quantity: str = Field(..., example="450 kg")
    priority: str = Field(..., example="High")


class AGVEvaluationResult(BaseModel):
    id: str
    location: str
    distance_to_pickup: int
    battery: int
    workload_status: str
    workload_score: int
    congestion_score: int
    priority_score: int
    overall_score: int
    is_eligible: bool
    status_label: str


class OptimizationResponse(BaseModel):
    status: str
    selected_agv: str
    optimization_score: float
    source: str
    destination: str
    material_type: str
    quantity: str
    priority: str
    route: List[str]
    distance_meters: int
    estimated_time_minutes: float
    battery_usage_percent: float
    congestion_level: str
    avg_congestion_factor: float
    evaluations: List[AGVEvaluationResult]
