/**
 * Autonomous Factory Material Flow Optimization
 * Factory Overview Dashboard Controller
 */

// Data Model
const dashboardData = {
  summary: {
    totalAgvs: 5,
    availableAgvs: 2,
    activeTasks: 2,
    pendingTasks: 4,
    lowBatteryAgvs: 1
  },
  systemStatus: {
    fleetStatus: "Operational",
    optimizationEngine: "Ready",
    factoryNetwork: "Connected"
  },
  agvs: [
    {
      id: "AGV-01",
      location: "Zone A - Staging Bay 1",
      subLocation: "Grid A1-04",
      battery: 88,
      status: "Available",
      statusType: "available",
      currentTask: "None (Standby)"
    },
    {
      id: "AGV-02",
      location: "Transit Corridor B-3",
      subLocation: "Node 114 -> Line 2",
      battery: 64,
      status: "In Transit",
      statusType: "in-transit",
      currentTask: "TSK-1042"
    },
    {
      id: "AGV-03",
      location: "Charging Dock 01",
      subLocation: "Bay C-South",
      battery: 18,
      status: "Charging",
      statusType: "charging",
      currentTask: "Maintenance Mode"
    },
    {
      id: "AGV-04",
      location: "Assembly Line 2 - Stn 4",
      subLocation: "Station Transfer Point",
      battery: 92,
      status: "Loading",
      statusType: "loading",
      currentTask: "TSK-1045"
    },
    {
      id: "AGV-05",
      location: "Zone C - Buffer Area",
      subLocation: "Grid C3-12",
      battery: 76,
      status: "Available",
      statusType: "available",
      currentTask: "None (Standby)"
    }
  ],
  materialTasks: [
    {
      id: "TSK-1042",
      material: "Sheet Metal Pallets (Grade A)",
      source: "Warehouse Bay 3",
      destination: "Press Station 2",
      priority: "High",
      assignedAgv: "AGV-02",
      status: "In Transit",
      statusType: "in-transit"
    },
    {
      id: "TSK-1045",
      material: "Sub-Assembly Harnesses",
      source: "Buffer Station 1",
      destination: "Assembly Line 2",
      priority: "Normal",
      assignedAgv: "AGV-04",
      status: "Loading",
      statusType: "loading"
    },
    {
      id: "TSK-1046",
      material: "Fastener Packs (M8 Grade 10.9)",
      source: "Warehouse Bay 1",
      destination: "Workcell 06",
      priority: "Normal",
      assignedAgv: "Unassigned",
      status: "Pending",
      statusType: "pending"
    },
    {
      id: "TSK-1047",
      material: "Hydraulic Actuators (4x)",
      source: "Receiving Dock 2",
      destination: "Heavy Assembly 1",
      priority: "High",
      assignedAgv: "Unassigned",
      status: "Pending",
      statusType: "pending"
    },
    {
      id: "TSK-1048",
      material: "Coolant Drums (50L)",
      source: "Chemical Stores",
      destination: "CNC Cell B",
      priority: "Low",
      assignedAgv: "Unassigned",
      status: "Pending",
      statusType: "pending"
    },
    {
      id: "TSK-1049",
      material: "Electronic Control Units",
      source: "Cleanroom Storage",
      destination: "Testing Bay 3",
      priority: "Normal",
      assignedAgv: "Unassigned",
      status: "Pending",
      statusType: "pending"
    }
  ]
};

// Render Functions
function renderSummaryCards(summary) {
  document.getElementById("kpi-total-agvs").textContent = summary.totalAgvs;
  document.getElementById("kpi-available").textContent = summary.availableAgvs;
  document.getElementById("kpi-active-tasks").textContent = summary.activeTasks;
  document.getElementById("kpi-pending-tasks").textContent = summary.pendingTasks;
  document.getElementById("kpi-low-battery").textContent = summary.lowBatteryAgvs;
}

function renderAgvTable(agvs) {
  const tbody = document.getElementById("agv-table-body");
  if (!tbody) return;

  tbody.innerHTML = agvs.map(agv => {
    const isLow = agv.battery <= 20;
    const badgeClass = `badge-${agv.statusType}`;
    const taskDisplay = agv.currentTask.startsWith("TSK") 
      ? `<span class="task-cell-link">${escapeHtml(agv.currentTask)}</span>`
      : `<span class="text-muted">${escapeHtml(agv.currentTask)}</span>`;

    return `
      <tr>
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
}

function renderMaterialTasksTable(tasks) {
  const tbody = document.getElementById("tasks-table-body");
  if (!tbody) return;

  tbody.innerHTML = tasks.map(task => {
    const badgeClass = `badge-${task.statusType}`;
    const priorityClass = `priority-${task.priority.toLowerCase()}`;
    const agvDisplay = task.assignedAgv !== "Unassigned"
      ? `<span class="id-cell">${escapeHtml(task.assignedAgv)}</span>`
      : `<span class="text-muted">Unassigned</span>`;

    return `
      <tr>
        <td class="id-cell">${escapeHtml(task.id)}</td>
        <td><strong>${escapeHtml(task.material)}</strong></td>
        <td>${escapeHtml(task.source)}</td>
        <td>${escapeHtml(task.destination)}</td>
        <td>
          <span class="${priorityClass}">${escapeHtml(task.priority)}</span>
        </td>
        <td>${agvDisplay}</td>
        <td>
          <span class="badge ${badgeClass}">
            <span class="dot"></span>
            ${escapeHtml(task.status)}
          </span>
        </td>
      </tr>
    `;
  }).join("");
}

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderSummaryCards(dashboardData.summary);
  renderAgvTable(dashboardData.agvs);
  renderMaterialTasksTable(dashboardData.materialTasks);
  updateClock();
  setInterval(updateClock, 1000);
});
