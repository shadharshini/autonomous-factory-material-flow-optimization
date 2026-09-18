# Autonomous Factory Material Flow Optimization

[![Problem Statement](https://img.shields.io/badge/Problem%20Statement%20ID-SI--04-blue.svg)](#problem-statement)
[![Team ID](https://img.shields.io/badge/Team%20ID-T--XX-green.svg)](#team-details)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)](#technology-stack)
[![Backend](https://img.shields.io/badge/Backend-Python%20FastAPI-009688.svg)](#technology-stack)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An industrial-grade, intelligent material flow and Automated Guided Vehicle (AGV) routing optimization system designed for autonomous manufacturing facilities. The platform bridges real-time SCADA/MES dashboard interfaces with a high-performance Python FastAPI backend implementing multi-criteria decision algorithms and A* graph pathfinding.

---

## Team & Problem Statement Details

- **Problem Statement ID**: `SI-04`
- **Team ID**: `T-XX`
- **Project Name**: Autonomous Factory Material Flow Optimization
- **Frontend Environment**: Port `8000` (Vanilla HTML5 / CSS3 / ES6 JavaScript)
- **Backend Environment**: Port `8001` (Python FastAPI + Uvicorn)

---

## Problem Statement

Modern manufacturing environments face significant material transfer bottlenecks, dynamic corridor congestion, unbalanced vehicle workloads, and battery drain inefficiencies. Traditional static routing or first-come-first-serve AGV dispatching systems fail under dynamic high-volume conditions, leading to:

1. **Unbalanced fleet utilization**: Some AGVs remain overloaded while others idle in distant zones.
2. **Corridor traffic contention**: Multiple vehicles competing for narrow factory aisles without real-time congestion awareness.
3. **Premature battery depletion**: Dispatching low-battery AGVs on lengthy transport runs, risking mid-corridor shutdowns.
4. **Sub-optimal task turnaround times**: Inability to factor in material priority during high-demand surges.

**The Solution**: An autonomous material flow orchestration platform that evaluates fleet readiness using a multi-criteria weighted matrix and calculates optimal, collision-resilient travel paths via the A* pathfinding algorithm over a digitized factory topology graph.

---

## System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │           Client Browser Interface           │
                               │        http://localhost:8000 (SCADA UI)      │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      │ HTTP / JSON (REST API)
                                                      │ CORS Enabled
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           FastAPI Backend Service            │
                               │          http://127.0.0.1:8001/api           │
                               └───────────┬──────────────────────┬───────────┘
                                           │                      │
                                           ▼                      ▼
                     ┌───────────────────────────┐  ┌───────────────────────────┐
                     │   Multi-Criteria Scoring  │  │  A* Pathfinding Algorithm │
                     │       Decision Engine     │  │       Topology Solver     │
                     └─────────────┬─────────────┘  └─────────────┬─────────────┘
                                   │                              │
                                   └──────────────┬───────────────┘
                                                  ▼
                               ┌──────────────────────────────────────────────┐
                               │         Deterministic Best AGV & Route       │
                               │              Dispatch Response               │
                               └──────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **HTML5**: Semantic markup structured for industrial supervisory systems.
- **CSS3**: Professional industrial dark navy / light-grey theme with responsive layouts, CSS Grid, Flexbox, custom status badges, and loading spinners.
- **Vanilla JavaScript (ES6+)**: Pure asynchronous client (`fetch` API), event-driven DOM updates, real-time clock, and modal dialog controllers (zero external framework dependencies).

### Backend
- **Python 3.10+**: Core programming runtime.
- **FastAPI**: Modern, high-performance web framework for building APIs.
- **Uvicorn**: Lightning-fast ASGI web server implementation.
- **Pydantic v2**: Robust data validation and strict schema enforcement.
- **CORS Middleware**: Pre-configured cross-origin resource sharing allowing safe requests from port `8000`.

---

## Features & Application Modules

### 1. Factory Overview Dashboard (`index.html`)
- **System KPIs**: Real-time summary cards displaying Total AGVs (5), Available units (2), Active tasks (2), Pending tasks (4), and Low battery alerts (1).
- **Master AGV Status Table**: Immediate visibility into location, battery percentage, operational mode, and active assignments.
- **Active Material Tasks**: Priority-sorted logistics queue with material classifications and status indicators.
- **System Health Status**: Live indicators for Fleet Status, Optimization Engine, and Factory Network.

### 2. AGV Fleet Management (`fleet.html`)
- **Master Fleet Roster**: Detailed telemetry across all 5 demo units (`AGV-01` through `AGV-05`).
- **Interactive Telemetry Sidebar**: Clicking any AGV displays deep diagnostic metrics including vehicle model, lifetime hours, battery gauge, and completed task history.

### 3. Material Tasks Management (`tasks.html`)
- **Interactive Task Registry**: Tracks Task ID, material category, source, destination, quantity, priority, assigned vehicle, transit status, and estimated duration.
- **Multi-Filter Controls**: Filter the dispatch queue instantly by Status (*Pending, Assigned, In Transit, Completed*), Priority (*Low, Medium, High, Urgent*), or Assigned AGV.
- **Dynamic Task Creation Modal**: Modal form allowing operators to register new material transport orders.

### 4. 2D Factory Floor Map (`map.html`)
- **Vector Layout (SVG)**: Visual floor plan mapping 8 primary zones:
  - *Storage Area A*, *Storage Area B*, *Production Station 1*, *Production Station 2*, *Loading Area*, *Unloading Area*, *Charging Station*, *Maintenance Area*.
- **Live AGV Waypoints**: Real-time vehicle positions with interactive selection, route path overlays, and start/destination indicators.

### 5. Intelligent Optimization Engine (`optimization.html`)
- **Dispatch Parameters Form**: Configurable Source, Destination, Material Type, Quantity, and Priority.
- **Interactive Scoring Matrix Table**: Displays mathematical breakdown across distance, battery, workload, congestion, and priority suitability for every vehicle.
- **Optimization Results Card**: Highlights the selected AGV, score, route path pills, travel time, distance, battery usage, and active congestion factor.
- **State Indicators**: Dedicated `"Optimizing..."` loading state on dispatch button and graceful error banners if the backend is unreachable.

---

## Optimization Workflow

```
Material Transport Task
        │
        ▼
AGV Evaluation (Distance, Battery, Workload, Congestion, Priority)
        │
        ▼
Multi-Criteria Weighted Scoring
        │
        ▼
Best AGV Selection (Highest Weighted Composite Score)
        │
        ▼
A* Pathfinding Route Selection (Deterministic Corridor Graph)
        │
        ▼
Final Vehicle Assignment & Dispatch Telemetry
```

### Mathematical Scoring Formula

The system evaluates each AGV candidate using a multi-criteria weighted scoring algorithm:

$$\text{Overall Score} = (\text{Distance Score} \times 0.30) + (\text{Battery Score} \times 0.25) + (\text{Workload Score} \times 0.15) + (\text{Congestion Score} \times 0.15) + (\text{Priority Score} \times 0.15)$$

- **Distance Score (30%)**: Scaled inversely based on physical A* corridor distance from AGV current location to the pickup station.
- **Battery Score (25%)**: Linear scale based on state of charge (SoC), with critical penalty applied for battery levels $<20\%$.
- **Workload Score (15%)**: Weighted by availability state (Available = 100, Loading = 60, Busy = 50, Charging = 30, Maintenance = 0).
- **Congestion Score (15%)**: Scaled against average transit corridor traffic multipliers.
- **Priority Suitability (15%)**: Ensures high-priority and urgent tasks are matched to available AGVs with $>80\%$ battery reserves.

---

## Repository Structure

```
autonomous-factory-material-flow-optimization/
├── .gitignore               # Comprehensive Git exclusion rules
├── README.md                # Project documentation and setup guide
├── index.html               # Factory Overview Dashboard
├── dashboard.js             # Dashboard metrics and table logic
├── fleet.html               # AGV Fleet Management view
├── fleet.js                 # Fleet selection and telemetry panel logic
├── tasks.html               # Material Tasks management view
├── tasks.js                 # Task filtering and modal creation logic
├── map.html                 # 2D Factory Map view
├── map.js                   # Vector floor plan and vehicle marker controller
├── optimization.html        # Optimization Engine user interface
├── optimization.js          # Optimization API client and rendering logic
├── styles.css               # Unified industrial SCADA design stylesheet
└── backend/                 # Python FastAPI Backend
    ├── main.py              # Application entry point, CORS, and route handlers
    ├── models.py            # Pydantic schemas (request/response validation)
    ├── optimization.py      # Multi-criteria scoring and A* pathfinding engine
    └── requirements.txt     # Python backend dependencies
```

---

## Local Setup & Execution Guide

### Prerequisites
- **Python 3.10 or higher** installed on your system.
- Modern web browser (Chrome, Edge, Firefox, Safari).

---

### Step 1: Start the Backend Service (Port 8001)

1. Open a terminal / command prompt and navigate to the project root directory:
   ```bash
   cd "autonomous factory material flow optimization"
   ```

2. Create a Python virtual environment:
   ```bash
   # On Windows:
   python -m venv backend/.venv

   # On macOS/Linux:
   python3 -m venv backend/.venv
   ```

3. Activate the virtual environment:
   ```bash
   # On Windows (PowerShell):
   .\backend\.venv\Scripts\Activate.ps1

   # On Windows (Command Prompt):
   .\backend\.venv\Scripts\activate.bat

   # On macOS/Linux:
   source backend/.venv/bin/activate
   ```

4. Install the required dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

5. Launch the FastAPI server on port `8001`:
   ```bash
   uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
   ```

6. Confirm the backend is running by opening:
   - Health check: [http://127.0.0.1:8001/api/health](http://127.0.0.1:8001/api/health)
   - Interactive API Docs: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

---

### Step 2: Start the Frontend Server (Port 8000)

1. Open a **second** terminal window in the project root directory.

2. Start Python's built-in HTTP server on port `8000`:
   ```bash
   # On Windows / macOS / Linux:
   python -m http.server 8000
   ```

3. Open your browser and access the application pages:
   - **Dashboard**: [http://localhost:8000/index.html](http://localhost:8000/index.html)
   - **AGV Fleet**: [http://localhost:8000/fleet.html](http://localhost:8000/fleet.html)
   - **Material Tasks**: [http://localhost:8000/tasks.html](http://localhost:8000/tasks.html)
   - **Factory Map**: [http://localhost:8000/map.html](http://localhost:8000/map.html)
   - **Optimization Engine**: [http://localhost:8000/optimization.html](http://localhost:8000/optimization.html)

---

## API Endpoints Reference

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies operational readiness of the FastAPI backend service.
- **Sample Response**:
  ```json
  {
    "status": "ok",
    "message": "Backend is running"
  }
  ```

### 2. Task Optimization
- **Endpoint**: `POST /api/optimize`
- **Description**: Evaluates AGV candidate fitness and solves shortest A* corridor route.
- **Request Body**:
  ```json
  {
    "source": "Storage Area A",
    "destination": "Production Station 1",
    "material_type": "Raw Material",
    "quantity": "50",
    "priority": "High"
  }
  ```
- **Sample Response (HTTP 200 OK)**:
  ```json
  {
    "status": "success",
    "selected_agv": "AGV-01",
    "optimization_score": 97.0,
    "source": "Storage Area A",
    "destination": "Production Station 1",
    "material_type": "Raw Material",
    "quantity": "50",
    "priority": "High",
    "route": [
      "Storage Area A",
      "Loading Area",
      "Production Station 1"
    ],
    "distance_meters": 138,
    "estimated_time_minutes": 2.1,
    "battery_usage_percent": 1.9,
    "congestion_level": "Medium",
    "avg_congestion_factor": 1.10,
    "evaluations": [
      {
        "id": "AGV-01",
        "location": "Storage Area A",
        "distance_to_pickup": 0,
        "battery": 92,
        "workload_status": "Available",
        "workload_score": 100,
        "congestion_score": 100,
        "priority_score": 95,
        "overall_score": 97,
        "is_eligible": true,
        "status_label": "Selected (Best Match)"
      }
    ]
  }
  ```

---

## Testing the Complete Optimization Flow

1. Open [http://localhost:8000/optimization.html](http://localhost:8000/optimization.html).
2. Select:
   - **Source**: `Storage Area A`
   - **Destination**: `Production Station 1`
   - **Material Type**: `Raw Material`
   - **Quantity**: `50`
   - **Priority**: `High`
3. Click **"Run Optimization"**.
4. The button displays `"Optimizing..."` while sending the payload to `http://127.0.0.1:8001/api/optimize`.
5. The optimization engine selects **`AGV-01`** (Score: `97.0/100`) and displays the recommended route:
   $$\text{Storage Area A} \longrightarrow \text{Loading Area} \longrightarrow \text{Production Station 1}$$
   along with distance (`138 m`), estimated travel time (`2.1 mins`), battery consumption (`~1.9%`), and traffic congestion.
6. The AGV multi-criteria scoring matrix highlights `AGV-01` with a `[WINNER]` status badge.

---

## License

This project is licensed under the MIT License.
