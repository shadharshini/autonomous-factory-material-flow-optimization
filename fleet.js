/**
 * Autonomous Factory Material Flow Optimization
 * AGV Fleet Management Controller
 */

// Demo Fleet Data (5 AGVs as specified)
const agvFleetData = [
  {
    id: "AGV-01",
    location: "Storage A",
    subLocation: "Rack A-04, Zone 1",
    battery: 92,
    status: "Available",
    statusType: "available",
    currentTask: "No Task",
    model: "L-Cart 1200 Pro",
    payloadCapacity: "1,200 kg",
    totalOperatingHours: "1,420 hrs",
    completedTasksCount: 24,
    completedTasks: [
      { id: "TASK-098", material: "Raw Steel Sheets", time: "14 min ago", source: "Storage A", dest: "Press Bay 1" },
      { id: "TASK-089", material: "Stamping Dies Set #3", time: "42 min ago", source: "Tool Crib", dest: "Press Bay 2" },
      { id: "TASK-074", material: "Fastener Bins (x12)", time: "1 hr 15m ago", source: "Storage A", dest: "Assembly Line 1" }
    ]
  },
  {
    id: "AGV-02",
    location: "Production B",
    subLocation: "Workcell B-02 Infeed",
    battery: 76,
    status: "Busy",
    statusType: "active",
    currentTask: "TASK-002",
    model: "L-Cart 1200 Pro",
    payloadCapacity: "1,200 kg",
    totalOperatingHours: "1,890 hrs",
    completedTasksCount: 31,
    completedTasks: [
      { id: "TASK-001", material: "Powertrain Castings", time: "28 min ago", source: "Foundry Dock", dest: "Production B" },
      { id: "TASK-095", material: "Machined Housings", time: "1 hr 02m ago", source: "CNC Cell 2", dest: "Inspection Bay" },
      { id: "TASK-082", material: "Hydraulic Pumps (x6)", time: "2 hrs ago", source: "Storage B", dest: "Production B" }
    ]
  },
  {
    id: "AGV-03",
    location: "Charging Station",
    subLocation: "Dock Pad #02",
    battery: 31,
    status: "Charging",
    statusType: "charging",
    currentTask: "No Task",
    model: "Heavy-Tug 2500",
    payloadCapacity: "2,500 kg",
    totalOperatingHours: "2,150 hrs",
    completedTasksCount: 19,
    completedTasks: [
      { id: "TASK-091", material: "Heavy Pallet Load (Chassis)", time: "55 min ago", source: "Receiving 1", dest: "Storage C" },
      { id: "TASK-079", material: "Motor Assemblies (x4)", time: "2 hrs 10m ago", source: "Storage B", dest: "Line 2" },
      { id: "TASK-065", material: "Battery Modules Pack", time: "3 hrs 40m ago", source: "Hazmat Store", dest: "Line 3" }
    ]
  },
  {
    id: "AGV-04",
    location: "Storage C",
    subLocation: "Aisle C-08, Bay 2",
    battery: 84,
    status: "Available",
    statusType: "available",
    currentTask: "No Task",
    model: "L-Cart 1200 Pro",
    payloadCapacity: "1,200 kg",
    totalOperatingHours: "960 hrs",
    completedTasksCount: 16,
    completedTasks: [
      { id: "TASK-094", material: "Wiring Harness Cartons", time: "36 min ago", source: "Storage C", dest: "Assembly Sub-3" },
      { id: "TASK-088", material: "Connector Kits (Batch D)", time: "1 hr 22m ago", source: "Clean Stores", dest: "Assembly Sub-1" },
      { id: "TASK-070", material: "Console Moldings", time: "2 hrs 45m ago", source: "Storage C", dest: "Packaging 1" }
    ]
  },
  {
    id: "AGV-05",
    location: "Maintenance Area",
    subLocation: "Service Bay 01",
    battery: 15,
    status: "Maintenance",
    statusType: "low-battery",
    currentTask: "No Task",
    model: "Compact-Move 800",
    payloadCapacity: "800 kg",
    totalOperatingHours: "3,410 hrs",
    completedTasksCount: 42,
    completedTasks: [
      { id: "TASK-077", material: "Inspection Kits", time: "4 hrs ago", source: "Tool Crib", dest: "Quality Lab" },
      { id: "TASK-063", material: "Filter Assemblies", time: "5 hrs 20m ago", source: "Storage A", dest: "CNC Area" },
      { id: "TASK-052", material: "Calibration Jig", time: "7 hrs ago", source: "Metrology Room", dest: "Cell 4" }
    ]
  }
];

let selectedAgvId = "AGV-01";

// Helper function to escape HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Render Fleet Table
function renderFleetTable() {
  const tbody = document.getElementById("fleet-table-body");
  if (!tbody) return;

  tbody.innerHTML = agvFleetData.map(agv => {
    const isSelected = agv.id === selectedAgvId;
    const isLow = agv.battery <= 20;
    const badgeClass = `badge-${agv.statusType}`;
    const taskDisplay = agv.currentTask !== "No Task"
      ? `<span class="task-cell-link">${escapeHtml(agv.currentTask)}</span>`
      : `<span class="text-muted">No Task</span>`;

    return `
      <tr class="selectable-row ${isSelected ? 'selected' : ''}" data-agv-id="${escapeHtml(agv.id)}">
        <td class="id-cell">${escapeHtml(agv.id)}</td>
        <td>
          <div>${escapeHtml(agv.location)}</div>
          <div class="sub-location">${escapeHtml(agv.subLocation)}</div>
        </td>
        <td>
          <div class="battery-wrapper">
            <div class="battery-bar">
              <div class="battery-fill ${isLow ? 'low' : ''}" style="width: ${agv.battery}%"></div>
            </div>
            <span class="battery-text ${isLow ? 'low' : ''}">${agv.battery}%</span>
          </div>
        </td>
        <td>
          <span class="badge ${badgeClass}">
            <span class="dot"></span>
            ${escapeHtml(agv.status)}
          </span>
        </td>
        <td>${taskDisplay}</td>
      </tr>
    `;
  }).join("");

  // Attach click listeners to rows
  const rows = tbody.querySelectorAll(".selectable-row");
  rows.forEach(row => {
    row.addEventListener("click", () => {
      const agvId = row.getAttribute("data-agv-id");
      selectAgv(agvId);
    });
  });
}

// Select an AGV and update details panel
function selectAgv(agvId) {
  selectedAgvId = agvId;
  const agv = agvFleetData.find(item => item.id === agvId);
  if (!agv) return;

  // Highlight row
  const rows = document.querySelectorAll("#fleet-table-body .selectable-row");
  rows.forEach(row => {
    if (row.getAttribute("data-agv-id") === agvId) {
      row.classList.add("selected");
    } else {
      row.classList.remove("selected");
    }
  });

  renderDetailsPanel(agv);
}

// Render Details Panel
function renderDetailsPanel(agv) {
  const isLow = agv.battery <= 20;
  const badgeClass = `badge-${agv.statusType}`;
  const taskText = agv.currentTask !== "No Task"
    ? `<span class="task-cell-link">${escapeHtml(agv.currentTask)}</span>`
    : `<span class="text-muted">No Task</span>`;

  // Basic Header Info
  document.getElementById("detail-agv-id").textContent = agv.id;
  document.getElementById("detail-status-badge").className = `badge ${badgeClass}`;
  document.getElementById("detail-status-badge").innerHTML = `<span class="dot"></span>${escapeHtml(agv.status)}`;

  // Battery
  const batteryFill = document.getElementById("detail-battery-fill");
  batteryFill.style.width = `${agv.battery}%`;
  if (isLow) {
    batteryFill.classList.add("low");
  } else {
    batteryFill.classList.remove("low");
  }
  document.getElementById("detail-battery-val").textContent = `${agv.battery}%`;
  if (isLow) {
    document.getElementById("detail-battery-val").classList.add("low");
  } else {
    document.getElementById("detail-battery-val").classList.remove("low");
  }

  // Location & Tasks
  document.getElementById("detail-location").textContent = agv.location;
  document.getElementById("detail-sublocation").textContent = agv.subLocation;
  document.getElementById("detail-current-task").innerHTML = taskText;
  document.getElementById("detail-model").textContent = agv.model;
  document.getElementById("detail-operating-hours").textContent = agv.totalOperatingHours;
  document.getElementById("detail-completed-count").textContent = `${agv.completedTasksCount} Completed`;

  // Completed Tasks List
  const completedList = document.getElementById("detail-completed-tasks");
  if (completedList) {
    completedList.innerHTML = agv.completedTasks.map(task => `
      <li class="completed-task-item">
        <div>
          <span class="completed-task-id">${escapeHtml(task.id)}</span>
          <span style="color: var(--text-secondary); margin-left: 8px;">${escapeHtml(task.material)}</span>
        </div>
        <div class="completed-task-meta">${escapeHtml(task.source)} &rarr; ${escapeHtml(task.dest)} &bull; ${escapeHtml(task.time)}</div>
      </li>
    `).join("");
  }
}

// Clock updates
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

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  renderFleetTable();
  selectAgv(selectedAgvId);
  updateClock();
  setInterval(updateClock, 1000);
});
