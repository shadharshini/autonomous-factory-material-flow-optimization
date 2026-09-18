/**
 * Autonomous Factory Material Flow Optimization
 * Material Tasks Management Controller
 */

// Initial 8 Realistic Demo Tasks
let tasksData = [
  {
    id: "TSK-201",
    material: "Steel Parts (Sheet Metal)",
    materialCategory: "Steel Parts",
    source: "Storage A",
    destination: "Press Station 2",
    quantity: "450 kg",
    priority: "High",
    assignedAgv: "AGV-02",
    status: "In Transit",
    statusType: "in-transit",
    estimatedTime: "8 mins"
  },
  {
    id: "TSK-202",
    material: "Electronic Components (Sensor Boards)",
    materialCategory: "Electronic Components",
    source: "Cleanroom Bay 1",
    destination: "Assembly Sub-2",
    quantity: "35 units",
    priority: "Urgent",
    assignedAgv: "AGV-04",
    status: "Assigned",
    statusType: "assigned",
    estimatedTime: "5 mins"
  },
  {
    id: "TSK-203",
    material: "Raw Material (Aluminum Ingots)",
    materialCategory: "Raw Material",
    source: "Receiving Dock 1",
    destination: "Foundry Bay",
    quantity: "1,200 kg",
    priority: "Medium",
    assignedAgv: "Unassigned",
    status: "Pending",
    statusType: "pending",
    estimatedTime: "20 mins"
  },
  {
    id: "TSK-204",
    material: "Packaging Material (Corrugated Boxes)",
    materialCategory: "Packaging Material",
    source: "Storage C",
    destination: "Packaging Cell 1",
    quantity: "80 packs",
    priority: "Low",
    assignedAgv: "AGV-01",
    status: "Completed",
    statusType: "completed",
    estimatedTime: "0 mins"
  },
  {
    id: "TSK-205",
    material: "Finished Goods (Electric Motors)",
    materialCategory: "Finished Goods",
    source: "Assembly Line 1",
    destination: "Shipping Dock B",
    quantity: "12 pallets",
    priority: "High",
    assignedAgv: "AGV-03",
    status: "Completed",
    statusType: "completed",
    estimatedTime: "0 mins"
  },
  {
    id: "TSK-206",
    material: "Steel Parts (M8 Fastener Packs)",
    materialCategory: "Steel Parts",
    source: "Storage A",
    destination: "Workcell 06",
    quantity: "150 kg",
    priority: "Medium",
    assignedAgv: "Unassigned",
    status: "Pending",
    statusType: "pending",
    estimatedTime: "14 mins"
  },
  {
    id: "TSK-207",
    material: "Raw Material (Copper Wire Spools)",
    materialCategory: "Raw Material",
    source: "Storage B",
    destination: "Coil Winding Stn",
    quantity: "300 kg",
    priority: "Urgent",
    assignedAgv: "Unassigned",
    status: "Pending",
    statusType: "pending",
    estimatedTime: "12 mins"
  },
  {
    id: "TSK-208",
    material: "Electronic Components (Power Inverters)",
    materialCategory: "Electronic Components",
    source: "Cleanroom Bay 2",
    destination: "Testing Bay 3",
    quantity: "24 units",
    priority: "Low",
    assignedAgv: "Unassigned",
    status: "Pending",
    statusType: "pending",
    estimatedTime: "25 mins"
  }
];

let nextTaskIdNumber = 209;

// Escape HTML utility
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Render Tasks Table based on filters
function renderTasksTable() {
  const statusFilter = document.getElementById("filter-status") ? document.getElementById("filter-status").value : "all";
  const priorityFilter = document.getElementById("filter-priority") ? document.getElementById("filter-priority").value : "all";
  const agvFilter = document.getElementById("filter-agv") ? document.getElementById("filter-agv").value : "all";

  const filteredTasks = tasksData.filter(task => {
    const matchStatus = (statusFilter === "all") || (task.status.toLowerCase() === statusFilter.toLowerCase());
    const matchPriority = (priorityFilter === "all") || (task.priority.toLowerCase() === priorityFilter.toLowerCase());
    const matchAgv = (agvFilter === "all") || (task.assignedAgv.toLowerCase() === agvFilter.toLowerCase());
    return matchStatus && matchPriority && matchAgv;
  });

  const tbody = document.getElementById("tasks-table-body");
  if (!tbody) return;

  if (filteredTasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 24px; color: var(--text-muted);">
          No material tasks match the selected filter criteria.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = filteredTasks.map(task => {
      const priorityClass = `priority-${task.priority.toLowerCase()}`;
      const badgeClass = `badge-${task.statusType}`;
      const agvCell = task.assignedAgv !== "Unassigned"
        ? `<span class="id-cell">${escapeHtml(task.assignedAgv)}</span>`
        : `<span class="text-muted">Unassigned</span>`;

      return `
        <tr>
          <td class="id-cell">${escapeHtml(task.id)}</td>
          <td>
            <div><strong>${escapeHtml(task.material)}</strong></div>
            <div class="sub-location">${escapeHtml(task.materialCategory || '')}</div>
          </td>
          <td>${escapeHtml(task.source)}</td>
          <td>${escapeHtml(task.destination)}</td>
          <td style="font-family: var(--font-mono);">${escapeHtml(task.quantity)}</td>
          <td><span class="${priorityClass}">${escapeHtml(task.priority)}</span></td>
          <td>${agvCell}</td>
          <td>
            <span class="badge ${badgeClass}">
              <span class="dot"></span>
              ${escapeHtml(task.status)}
            </span>
          </td>
          <td style="font-family: var(--font-mono); color: var(--text-secondary);">${escapeHtml(task.estimatedTime)}</td>
        </tr>
      `;
    }).join("");
  }

  // Update counters
  const totalCountEl = document.getElementById("task-counter");
  if (totalCountEl) {
    totalCountEl.textContent = `${filteredTasks.length} of ${tasksData.length} Tasks`;
  }

  updateSummaryMetrics();
}

// Update KPI chips on top
function updateSummaryMetrics() {
  const total = tasksData.length;
  const pending = tasksData.filter(t => t.status === "Pending").length;
  const inTransit = tasksData.filter(t => t.status === "In Transit").length;
  const assigned = tasksData.filter(t => t.status === "Assigned").length;
  const completed = tasksData.filter(t => t.status === "Completed").length;

  if (document.getElementById("stat-total")) document.getElementById("stat-total").textContent = total;
  if (document.getElementById("stat-pending")) document.getElementById("stat-pending").textContent = pending;
  if (document.getElementById("stat-in-transit")) document.getElementById("stat-in-transit").textContent = inTransit;
  if (document.getElementById("stat-assigned")) document.getElementById("stat-assigned").textContent = assigned;
  if (document.getElementById("stat-completed")) document.getElementById("stat-completed").textContent = completed;
}

// Modal handling
function openCreateTaskModal() {
  const modal = document.getElementById("modal-create-task");
  if (modal) {
    modal.classList.add("active");
    // Focus first input
    const firstInput = document.getElementById("form-source");
    if (firstInput) firstInput.focus();
  }
}

function closeCreateTaskModal() {
  const modal = document.getElementById("modal-create-task");
  if (modal) {
    modal.classList.remove("active");
    const form = document.getElementById("create-task-form");
    if (form) form.reset();
  }
}

// Handle Form Submit
function handleCreateTaskSubmit(e) {
  e.preventDefault();

  const source = document.getElementById("form-source").value.trim();
  const destination = document.getElementById("form-destination").value.trim();
  const materialType = document.getElementById("form-material-type").value;
  const quantity = document.getElementById("form-quantity").value.trim();
  const priority = document.getElementById("form-priority").value;
  const requiredTime = document.getElementById("form-required-time").value.trim();

  if (!source || !destination || !quantity) {
    alert("Please fill in all required fields.");
    return;
  }

  const newTask = {
    id: `TSK-${nextTaskIdNumber++}`,
    material: `${materialType} (Custom Batch)`,
    materialCategory: materialType,
    source: source,
    destination: destination,
    quantity: quantity,
    priority: priority,
    assignedAgv: "Unassigned",
    status: "Pending",
    statusType: "pending",
    estimatedTime: requiredTime || "15 mins"
  };

  // Append new task to beginning of list
  tasksData.unshift(newTask);

  // Reset filters to show the newly added task
  if (document.getElementById("filter-status")) document.getElementById("filter-status").value = "all";
  if (document.getElementById("filter-priority")) document.getElementById("filter-priority").value = "all";
  if (document.getElementById("filter-agv")) document.getElementById("filter-agv").value = "all";

  closeCreateTaskModal();
  renderTasksTable();
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

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  renderTasksTable();
  updateClock();
  setInterval(updateClock, 1000);

  // Filter Listeners
  const filterStatus = document.getElementById("filter-status");
  const filterPriority = document.getElementById("filter-priority");
  const filterAgv = document.getElementById("filter-agv");

  if (filterStatus) filterStatus.addEventListener("change", renderTasksTable);
  if (filterPriority) filterPriority.addEventListener("change", renderTasksTable);
  if (filterAgv) filterAgv.addEventListener("change", renderTasksTable);

  // Modal Open/Close
  const btnOpenModal = document.getElementById("btn-open-create-task");
  if (btnOpenModal) btnOpenModal.addEventListener("click", openCreateTaskModal);

  const btnCloseModal = document.getElementById("btn-close-modal");
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeCreateTaskModal);

  const btnCancelModal = document.getElementById("btn-cancel-modal");
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeCreateTaskModal);

  // Modal Overlay click outside
  const modalOverlay = document.getElementById("modal-create-task");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeCreateTaskModal();
    });
  }

  // Form Submit
  const form = document.getElementById("create-task-form");
  if (form) form.addEventListener("submit", handleCreateTaskSubmit);
});
