/**
 * Autonomous Factory Material Flow Optimization
 * 2D Factory Map Controller
 */

// Simulated AGV Map Data
const mapAgvData = [
  {
    id: "AGV-01",
    location: "Storage Area A",
    subLocation: "Aisle A-01, Rack Staging",
    battery: 92,
    status: "Available",
    statusType: "available",
    currentTask: "No Task (Standby)",
    destination: "None (Holding Position)",
    speed: "0.0 m/s",
    loadStatus: "Empty (0 kg)",
    nextCheckpoint: "Station A Idle Loop"
  },
  {
    id: "AGV-02",
    location: "Main Transit Corridor",
    subLocation: "Node N-14 -> Production 2 Infeed",
    battery: 76,
    status: "In Transit",
    statusType: "in-transit",
    currentTask: "TSK-201: Steel Parts (450 kg)",
    destination: "Production Station 2",
    speed: "1.2 m/s",
    loadStatus: "Loaded (Sheet Metal Pallet)",
    nextCheckpoint: "Intersection C-2 (Est. 45s)"
  },
  {
    id: "AGV-03",
    location: "Charging Station",
    subLocation: "Dock Pad #02 (Inductive Charger)",
    battery: 31,
    status: "Charging",
    statusType: "charging",
    currentTask: "Fast Charging (Rate +1.2%/min)",
    destination: "Charging Station Dock",
    speed: "0.0 m/s",
    loadStatus: "Empty",
    nextCheckpoint: "Target 90% Battery (Est. 48 mins)"
  },
  {
    id: "AGV-04",
    location: "Loading Area",
    subLocation: "Transfer Dock L1",
    battery: 84,
    status: "Loading",
    statusType: "loading",
    currentTask: "TSK-202: Sensor Boards (35 units)",
    destination: "Production Station 1",
    speed: "0.0 m/s",
    loadStatus: "Transfer In Progress (75%)",
    nextCheckpoint: "Depart via North Guide Path"
  },
  {
    id: "AGV-05",
    location: "Maintenance Area",
    subLocation: "Diagnostic Bay 01",
    battery: 15,
    status: "Maintenance",
    statusType: "low-battery",
    currentTask: "Scheduled Wheel Alignment & Calibration",
    destination: "Maintenance Service Bay",
    speed: "0.0 m/s",
    loadStatus: "Offline",
    nextCheckpoint: "System Check (Release in 2.5 hrs)"
  }
];

let selectedAgvId = "AGV-02"; // Default to active moving AGV for demonstration

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Select an AGV and update both map highlighting and right-hand telemetry panel
function selectMapAgv(agvId) {
  selectedAgvId = agvId;
  const agv = mapAgvData.find(a => a.id === agvId);
  if (!agv) return;

  // 1. Update SVG markers
  const markers = document.querySelectorAll(".svg-agv-marker");
  markers.forEach(marker => {
    if (marker.getAttribute("data-agv-id") === agvId) {
      marker.classList.add("selected");
    } else {
      marker.classList.remove("selected");
    }
  });

  // 2. Update Quick Selector Buttons
  const buttons = document.querySelectorAll(".agv-chip-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-agv-id") === agvId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 3. Update Right Telemetry Panel
  updateTelemetryPanel(agv);
}

// Update the right-hand panel with selected AGV details
function updateTelemetryPanel(agv) {
  const isLow = agv.battery <= 20;
  const badgeClass = `badge-${agv.statusType}`;

  // AGV ID and Status Badge
  const idEl = document.getElementById("panel-agv-id");
  if (idEl) idEl.textContent = agv.id;

  const badgeEl = document.getElementById("panel-status-badge");
  if (badgeEl) {
    badgeEl.className = `badge ${badgeClass}`;
    badgeEl.innerHTML = `<span class="dot"></span>${escapeHtml(agv.status)}`;
  }

  // Battery Display
  const fillEl = document.getElementById("panel-battery-fill");
  if (fillEl) {
    fillEl.style.width = `${agv.battery}%`;
    if (isLow) fillEl.classList.add("low");
    else fillEl.classList.remove("low");
  }

  const textEl = document.getElementById("panel-battery-text");
  if (textEl) {
    textEl.textContent = `${agv.battery}%`;
    if (isLow) textEl.classList.add("low");
    else textEl.classList.remove("low");
  }

  // Location, Task, Destination
  const locEl = document.getElementById("panel-location");
  if (locEl) locEl.textContent = agv.location;

  const subLocEl = document.getElementById("panel-sublocation");
  if (subLocEl) subLocEl.textContent = agv.subLocation;

  const taskEl = document.getElementById("panel-current-task");
  if (taskEl) taskEl.textContent = agv.currentTask;

  const destEl = document.getElementById("panel-destination");
  if (destEl) destEl.textContent = agv.destination;

  // Extra Telemetry Details
  const speedEl = document.getElementById("panel-speed");
  if (speedEl) speedEl.textContent = agv.speed;

  const loadEl = document.getElementById("panel-load-status");
  if (loadEl) loadEl.textContent = agv.loadStatus;

  const checkpointEl = document.getElementById("panel-next-checkpoint");
  if (checkpointEl) checkpointEl.textContent = agv.nextCheckpoint;
}

// Live Clock
function updateClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC+05:30`;
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Attach click listeners to SVG AGV markers
  const svgMarkers = document.querySelectorAll(".svg-agv-marker");
  svgMarkers.forEach(marker => {
    marker.addEventListener("click", () => {
      const agvId = marker.getAttribute("data-agv-id");
      if (agvId) selectMapAgv(agvId);
    });
  });

  // Attach click listeners to Quick Selector buttons
  const selectorButtons = document.querySelectorAll(".agv-chip-btn");
  selectorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const agvId = btn.getAttribute("data-agv-id");
      if (agvId) selectMapAgv(agvId);
    });
  });

  // Set initial selected AGV
  selectMapAgv(selectedAgvId);

  // Clock
  updateClock();
  setInterval(updateClock, 1000);
});
