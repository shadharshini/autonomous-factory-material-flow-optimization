/**
 * Autonomous Factory Material Flow Optimization
 * Optimization Engine Frontend Controller
 * Connects to FastAPI Backend at http://127.0.0.1:8001/api/optimize
 */

const BACKEND_API_URL = window.BACKEND_API_URL || 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "http://127.0.0.1:8001" 
    : "");

/**
 * Shows an error banner with a clear message
 */
function showError(message) {
  const errorBanner = document.getElementById("opt-error-banner");
  const errorMessage = document.getElementById("opt-error-message");
  if (errorMessage) {
    errorMessage.textContent = message;
  }
  if (errorBanner) {
    errorBanner.classList.add("visible");
  }
}

/**
 * Hides the error banner
 */
function hideError() {
  const errorBanner = document.getElementById("opt-error-banner");
  if (errorBanner) {
    errorBanner.classList.remove("visible");
  }
}

/**
 * Run Optimization Handler
 * Sends POST request to FastAPI backend with task parameters
 */
async function runOptimization() {
  const source = document.getElementById("opt-source")?.value || "";
  const destination = document.getElementById("opt-destination")?.value || "";
  const materialType = document.getElementById("opt-material")?.value || "";
  const quantity = document.getElementById("opt-quantity")?.value || "";
  const priority = document.getElementById("opt-priority")?.value || "";

  // Validate inputs
  if (source === destination) {
    showError("Source and Destination locations must be different.");
    return;
  }

  // Clear previous errors
  hideError();

  const runBtn = document.getElementById("btn-run-optimization");
  const originalBtnHtml = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
    Run Optimization
  `;

  // Set loading state on button
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = `
      <span class="spinner"></span>
      <span>Optimizing...</span>
    `;
  }

  try {
    const payload = {
      source: source,
      destination: destination,
      material_type: materialType,
      quantity: quantity,
      priority: priority
    };

    const response = await fetch(`${BACKEND_API_URL}/api/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorDetail = `Backend returned HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === "string" 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch (_) {
        if (response.statusText) errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();

    // 1. Render AGV Evaluation Matrix Table
    if (data.evaluations && Array.isArray(data.evaluations)) {
      renderEvaluationTable(data.evaluations, data.selected_agv);
    }

    // 2. Render Optimization Result Card
    renderResultCard(data);

    // 3. Update Engine Status Badge
    const engineBadge = document.getElementById("engine-status-badge");
    if (engineBadge) {
      engineBadge.className = "badge badge-ready";
      engineBadge.innerHTML = `<span class="dot"></span>Connected (FastAPI :8001)`;
    }

  } catch (err) {
    console.error("Optimization error:", err);
    let message = err.message || "Failed to execute optimization.";
    if (err.name === "TypeError" && (err.message.includes("fetch") || err.message.includes("NetworkError") || err.message.includes("Failed to fetch"))) {
      message = `Backend Service Unavailable: Could not connect to FastAPI server at ${BACKEND_API_URL}/api/optimize. Please ensure the backend is running.`;
    }
    showError(message);

    const engineBadge = document.getElementById("engine-status-badge");
    if (engineBadge) {
      engineBadge.className = "badge badge-warning";
      engineBadge.innerHTML = `<span class="dot"></span>Backend Offline`;
    }
  } finally {
    // Restore button state
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = originalBtnHtml;
    }
  }
}

/**
 * Render AGV Evaluation Table with Multi-Criteria Scores
 */
function renderEvaluationTable(evaluations, winnerId) {
  const tbody = document.getElementById("evaluation-table-body");
  if (!tbody) return;

  tbody.innerHTML = evaluations.map(a => {
    const isWinner = a.id === winnerId;
    const rowClass = isWinner ? "winner-row" : "";
    const scoreCellClass = isWinner ? "score-cell-winner" : "score-cell-normal";
    
    let statusBadge = "";
    if (isWinner) {
      statusBadge = `<span class="badge badge-operational"><span class="dot"></span>Selected Winner</span>`;
    } else if (a.is_eligible) {
      statusBadge = `<span class="text-muted">Candidate</span>`;
    } else {
      statusBadge = `<span class="badge badge-warning"><span class="dot"></span>Offline</span>`;
    }

    const distanceDisplay = a.is_eligible ? `${a.distance_to_pickup} m` : "&mdash;";
    const congestionDisplay = a.is_eligible ? `${a.congestion_score} / 100` : "&mdash;";
    const priorityDisplay = a.is_eligible ? `${a.priority_score} / 100` : "&mdash;";
    const overallDisplay = a.is_eligible ? `${Number(a.overall_score).toFixed(1)}` : "0.0";

    return `
      <tr class="${rowClass}">
        <td class="id-cell">
          ${escapeHtml(a.id)}
          ${isWinner ? ' <strong style="color: #166534; font-size: 11px;">[WINNER]</strong>' : ''}
        </td>
        <td>${escapeHtml(a.location)}</td>
        <td style="font-family: var(--font-mono);">${distanceDisplay}</td>
        <td style="font-family: var(--font-mono);">${a.battery}%</td>
        <td>${escapeHtml(a.workload_status)}</td>
        <td style="font-family: var(--font-mono);">${congestionDisplay}</td>
        <td style="font-family: var(--font-mono);">${priorityDisplay}</td>
        <td class="${scoreCellClass}">${overallDisplay}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join("");
}

/**
 * Render Results Section Card with Calculated Metrics
 */
function renderResultCard(data) {
  const card = document.getElementById("opt-result-card");
  if (!card) return;
  card.style.display = "block";

  // AGV and Score
  const agvEl = document.getElementById("res-selected-agv");
  if (agvEl) agvEl.textContent = data.selected_agv;

  const scoreEl = document.getElementById("res-score");
  if (scoreEl) scoreEl.textContent = `${Number(data.optimization_score).toFixed(1)} / 100`;

  // Distance
  const distEl = document.getElementById("res-distance");
  if (distEl) distEl.textContent = `${data.distance_meters} m`;

  // Estimated Travel Time
  const timeEl = document.getElementById("res-time");
  if (timeEl) {
    const minutes = Number(data.estimated_time_minutes).toFixed(1);
    const seconds = Math.round(data.estimated_time_minutes * 60);
    timeEl.textContent = `${minutes} mins (${seconds}s)`;
  }

  // Battery Consumption
  const battEl = document.getElementById("res-battery");
  if (battEl) {
    battEl.textContent = `~${Number(data.battery_usage_percent).toFixed(1)}%`;
  }

  // Congestion
  const congEl = document.getElementById("res-congestion");
  if (congEl) {
    congEl.textContent = `${data.congestion_level} (${Number(data.avg_congestion_factor).toFixed(2)}x)`;
  }

  // Route Flow Rendering
  const routeContainer = document.getElementById("res-route-path");
  if (routeContainer && Array.isArray(data.route)) {
    routeContainer.innerHTML = data.route.map((node, idx) => {
      const isOrigin = idx === 0;
      const isTarget = idx === data.route.length - 1;
      const pillClass = isOrigin ? "origin" : (isTarget ? "target" : "");
      const arrow = idx < data.route.length - 1 ? `<span class="route-connector">&rarr;</span>` : "";

      return `
        <span class="route-node-pill ${pillClass}">
          ${isOrigin ? '<strong>[START]</strong> ' : ''}
          ${isTarget ? '<strong>[DEST]</strong> ' : ''}
          ${escapeHtml(node)}
        </span>
        ${arrow}
      `;
    }).join("");
  }
}

/**
 * Escape HTML utility for XSS safety
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Top Navbar Clock
 */
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

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("btn-run-optimization");
  if (runBtn) {
    runBtn.addEventListener("click", runOptimization);
  }

  // Initial run on page load to fetch optimization result from backend
  runOptimization();

  // Initialize clock
  updateClock();
  setInterval(updateClock, 1000);
});

