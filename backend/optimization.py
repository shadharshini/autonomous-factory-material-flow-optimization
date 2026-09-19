import math
import heapq
from typing import Dict, List, Tuple
try:
    from .models import OptimizationRequest, OptimizationResponse, AGVEvaluationResult
except ImportError:
    from models import OptimizationRequest, OptimizationResponse, AGVEvaluationResult

# Factory Graph Nodes with 2D Coordinates
FACTORY_NODES: Dict[str, Tuple[float, float]] = {
    "Storage Area A": (140.0, 90.0),
    "Storage Area B": (140.0, 430.0),
    "Loading Area": (385.0, 80.0),
    "Unloading Area": (385.0, 440.0),
    "Production Station 1": (635.0, 90.0),
    "Production Station 2": (635.0, 260.0),
    "Charging Station": (625.0, 440.0),
    "Maintenance Area": (815.0, 440.0),
    
    # Key Corridor Waypoints & Intersections
    "Junction West": (140.0, 260.0),
    "Junction Central North": (385.0, 180.0),
    "Junction Central Mid": (385.0, 260.0),
    "Junction Central South": (385.0, 340.0),
    "Junction East North": (635.0, 180.0),
    "Junction East South": (635.0, 350.0)
}

# Factory Graph Edges (from, to, distance_meters, congestion_factor)
FACTORY_EDGES = [
    # West Corridor
    ("Storage Area A", "Junction West", 45, 1.0),
    ("Junction West", "Storage Area B", 45, 1.05),
    ("Storage Area A", "Loading Area", 60, 1.1),

    # Central Corridor Connections
    ("Loading Area", "Junction Central North", 25, 1.15),
    ("Junction Central North", "Junction Central Mid", 20, 1.2),
    ("Junction Central Mid", "Junction Central South", 20, 1.1),
    ("Junction Central South", "Unloading Area", 25, 1.05),

    # Cross-Facility Aisleways
    ("Junction West", "Junction Central Mid", 60, 1.1),
    ("Junction Central Mid", "Production Station 2", 60, 1.25),
    ("Junction Central North", "Junction East North", 60, 1.15),
    ("Junction Central South", "Junction East South", 60, 1.05),

    # East Corridor Connections
    ("Loading Area", "Production Station 1", 65, 1.1),
    ("Production Station 1", "Junction East North", 25, 1.2),
    ("Junction East North", "Production Station 2", 20, 1.3),
    ("Production Station 2", "Junction East South", 25, 1.1),
    ("Junction East South", "Charging Station", 25, 1.0),
    ("Charging Station", "Maintenance Area", 45, 1.0),
    ("Unloading Area", "Storage Area B", 60, 1.05)
]

# Build Bidirectional Adjacency Graph
ADJACENCY: Dict[str, List[Tuple[str, float, float]]] = {k: [] for k in FACTORY_NODES}
for u, v, dist, cong in FACTORY_EDGES:
    ADJACENCY[u].append((v, float(dist), float(cong)))
    ADJACENCY[v].append((u, float(dist), float(cong)))

# Simulated 5 Demo AGVs
DEMO_AGVS = [
    {
        "id": "AGV-01",
        "location": "Storage Area A",
        "battery": 92,
        "workload_status": "Available",
        "workload_score": 100,
        "base_congestion": 1.0
    },
    {
        "id": "AGV-02",
        "location": "Production Station 2",
        "battery": 76,
        "workload_status": "Busy (In Transit)",
        "workload_score": 50,
        "base_congestion": 1.25
    },
    {
        "id": "AGV-03",
        "location": "Charging Station",
        "battery": 31,
        "workload_status": "Charging",
        "workload_score": 30,
        "base_congestion": 1.0
    },
    {
        "id": "AGV-04",
        "location": "Loading Area",
        "battery": 84,
        "workload_status": "Loading",
        "workload_score": 60,
        "base_congestion": 1.15
    },
    {
        "id": "AGV-05",
        "location": "Maintenance Area",
        "battery": 15,
        "workload_status": "Maintenance (Offline)",
        "workload_score": 0,
        "base_congestion": 1.0
    }
]


def euclidean_heuristic(node_a: str, node_b: str) -> float:
    """Calculates Euclidean heuristic scaled to physical floor meters."""
    if node_a not in FACTORY_NODES or node_b not in FACTORY_NODES:
        return 0.0
    x1, y1 = FACTORY_NODES[node_a]
    x2, y2 = FACTORY_NODES[node_b]
    return math.hypot(x1 - x2, y1 - y2) * 0.25


def a_star_search(start_node: str, goal_node: str) -> Tuple[List[str], int, float]:
    """A* Pathfinding algorithm on factory graph returning (path, distance_meters, avg_congestion)."""
    if start_node == goal_node:
        return [start_node], 0, 1.0

    if start_node not in FACTORY_NODES or goal_node not in FACTORY_NODES:
        return [start_node, goal_node], 120, 1.1

    open_heap = []
    heapq.heappush(open_heap, (0.0, start_node))
    came_from: Dict[str, str] = {}
    g_score: Dict[str, float] = {k: float("inf") for k in FACTORY_NODES}
    g_score[start_node] = 0.0
    edge_congestions: Dict[str, float] = {}

    while open_heap:
        _, current = heapq.heappop(open_heap)

        if current == goal_node:
            path = [current]
            curr = current
            total_dist = 0.0
            congestion_sum = 0.0
            step_count = 0

            while curr in came_from:
                prev = came_from[curr]
                path.insert(0, prev)
                edge_cost = g_score[curr] - g_score[prev]
                total_dist += edge_cost
                congestion_sum += edge_congestions.get(f"{prev}->{curr}", 1.0)
                step_count += 1
                curr = prev

            avg_cong = (congestion_sum / step_count) if step_count > 0 else 1.0
            return path, int(round(total_dist)), round(avg_cong, 2)

        for neighbor, dist, cong in ADJACENCY.get(current, []):
            tentative_g = g_score[current] + (dist * cong)
            if tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                edge_congestions[f"{current}->{neighbor}"] = cong
                g_score[neighbor] = tentative_g
                f_score = tentative_g + euclidean_heuristic(neighbor, goal_node)
                heapq.heappush(open_heap, (f_score, neighbor))

    return [start_node, goal_node], 120, 1.1


def evaluate_agvs(source: str, destination: str, priority: str) -> List[AGVEvaluationResult]:
    """Evaluates all 5 AGVs using multi-criteria weighted scoring."""
    results = []

    for agv in DEMO_AGVS:
        # Excluded if offline / in maintenance
        if agv["workload_score"] == 0:
            results.append(AGVEvaluationResult(
                id=agv["id"],
                location=agv["location"],
                distance_to_pickup=999,
                battery=agv["battery"],
                workload_status=agv["workload_status"],
                workload_score=0,
                congestion_score=0,
                priority_score=0,
                overall_score=0,
                is_eligible=False,
                status_label="Excluded (Maintenance)"
            ))
            continue

        # 1. Distance score from AGV position to task pickup (source)
        _, dist_to_pickup, avg_cong = a_star_search(agv["location"], source)
        dist_score = max(10, min(100, int(round(100 - (dist_to_pickup * 0.45)))))

        # 2. Battery score
        battery_score = agv["battery"] if agv["battery"] >= 20 else 10

        # 3. Workload score
        work_score = agv["workload_score"]

        # 4. Congestion score
        congestion_score = int(round(100 / avg_cong))

        # 5. Priority suitability
        if priority.lower() == "urgent":
            prio_score = 100 if (agv["battery"] >= 80 and agv["workload_status"] == "Available") else 35
        elif priority.lower() == "high":
            prio_score = 95 if (agv["battery"] >= 60 and agv["workload_status"] == "Available") else 55
        elif priority.lower() == "medium":
            prio_score = 85 if agv["battery"] >= 40 else 60
        else:  # Low
            prio_score = 90

        # Weighted Overall Score:
        # Distance (0.30) + Battery (0.25) + Workload (0.15) + Congestion (0.15) + Priority (0.15)
        overall = int(round(
            (dist_score * 0.30) +
            (battery_score * 0.25) +
            (work_score * 0.15) +
            (congestion_score * 0.15) +
            (prio_score * 0.15)
        ))

        results.append(AGVEvaluationResult(
            id=agv["id"],
            location=agv["location"],
            distance_to_pickup=dist_to_pickup,
            battery=agv["battery"],
            workload_status=agv["workload_status"],
            workload_score=work_score,
            congestion_score=congestion_score,
            priority_score=prio_score,
            overall_score=overall,
            is_eligible=True,
            status_label="Candidate"
        ))

    return results


def run_optimization(req: OptimizationRequest) -> OptimizationResponse:
    """Executes multi-criteria evaluation and A* pathfinding for an optimization request."""
    # 1. Multi-criteria evaluation of the 5 AGVs
    evaluations = evaluate_agvs(req.source, req.destination, req.priority)

    # 2. Select winner (highest overall score among eligible AGVs)
    eligible = [e for e in evaluations if e.is_eligible]
    eligible.sort(key=lambda x: x.overall_score, reverse=True)
    winner = eligible[0] if eligible else evaluations[0]

    for ev in evaluations:
        if ev.id == winner.id:
            ev.status_label = "Selected (Best Match)"
        elif ev.is_eligible:
            ev.status_label = "Alternate Candidate"

    # 3. A* route computation from Source to Destination
    route_path, distance_m, avg_cong = a_star_search(req.source, req.destination)

    # Travel time: nominal speed 1.2 m/s + 4s per junction turn
    travel_seconds = int(round((distance_m / 1.2) + (len(route_path) * 4)))
    travel_minutes = round(travel_seconds / 60.0, 1)

    # Battery consumption rate
    payload_factor = 1.2 if req.priority.lower() == "urgent" else 1.0
    battery_draw = round(distance_m * 0.014 * payload_factor, 1)

    # Congestion classification
    if avg_cong > 1.18:
        congestion_level = "High"
    elif avg_cong > 1.08:
        congestion_level = "Medium"
    else:
        congestion_level = "Low"

    return OptimizationResponse(
        status="success",
        selected_agv=winner.id,
        optimization_score=float(winner.overall_score),
        source=req.source,
        destination=req.destination,
        material_type=req.material_type,
        quantity=req.quantity,
        priority=req.priority,
        route=route_path,
        distance_meters=distance_m,
        estimated_time_minutes=travel_minutes,
        battery_usage_percent=battery_draw,
        congestion_level=congestion_level,
        avg_congestion_factor=avg_cong,
        evaluations=evaluations
    )
