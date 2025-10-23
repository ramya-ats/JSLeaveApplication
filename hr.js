let currentAppId = null;

function closeModal() {
  document.getElementById("employeeModal").style.display = "none";
  currentAppId = null;
}

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("table tbody");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const clearBtn = document.querySelector(".clear-btn");

  const summaryBoxes = document.querySelectorAll(".box span");
  const totalRequestsBox = summaryBoxes[0];
  const pendingBox = summaryBoxes[1];
  const approvedBox = summaryBoxes[2];
  const rejectedBox = summaryBoxes[3];

  let applications = [];
  let filteredApplications = [];

  // Fetch all leave applications from backend
  async function fetchApplications() {
    try {
      const res = await fetch("http://localhost:5000/api/leave/all");

      if (!res.ok) throw new Error("Failed to fetch leave applications");
      applications = await res.json();
      filteredApplications = [...applications];
      updateSummaries();
      renderTable(filteredApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      tableBody.innerHTML = `<tr><td colspan="4" class="no-data">Error loading data.</td></tr>`;
    }
  }

  function renderTable(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No Leave Requests found.</td></tr>`;
      return;
    }

    data.forEach((app, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${app.employeeId}</td>
        <td>${app.employeeName}</td>
        <td>${app.status}</td>
        <td><button class="view-btn" data-index="${index}">View</button></td>
      `;
      tableBody.appendChild(row);
    });

    // Attach event listeners to all View buttons
    document.querySelectorAll(".view-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        viewApplication(Number(index));
      });
    });
  }

  function updateSummaries() {
    const total = applications.length;
    const pending = applications.filter(a => a.status === "Pending").length;
    const approved = applications.filter(a => a.status === "Approved").length;
    const rejected = applications.filter(a => a.status === "Rejected").length;

    totalRequestsBox.textContent = total;
    pendingBox.textContent = pending;
    approvedBox.textContent = approved;
    rejectedBox.textContent = rejected;
  }

  function filterApplications() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    filteredApplications = applications.filter(app => {
      const matchesSearch =
        app.employeeName.toLowerCase().includes(searchValue) ||
        app.employeeId.toLowerCase().includes(searchValue);

      const matchesStatus = selectedStatus === "All" || app.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    renderTable(filteredApplications);
  }

  searchInput.addEventListener("input", filterApplications);
  statusFilter.addEventListener("change", filterApplications);

  clearBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear all records?")) {
      try {
        const res = await fetch("http://localhost:5000/api/leave/clear", { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to clear records");
        applications = [];
        filteredApplications = [];
        renderTable([]);
        updateSummaries();
      } catch (error) {
        alert("Error clearing records.");
        console.error(error);
      }
    }
  });

  document.getElementById("approveBtn").addEventListener("click", () => {
    updateStatus("Approved");
  });

  document.getElementById("rejectBtn").addEventListener("click", () => {
    updateStatus("Rejected");
  });

  async function updateStatus(newStatus) {
    if (currentAppId === null) return;

    try {
      const res = await fetch(`http://localhost:5000/api/leave/${currentAppId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");

      const index = applications.findIndex(app => app.id === currentAppId);
      if (index !== -1) {
        applications[index].status = newStatus;
        filterApplications();
        updateSummaries();
      }
      closeModal();
    } catch (error) {
      alert("Error updating status.");
      console.error(error);
    }
  }

  function viewApplication(filteredIndex) {
    const app = filteredApplications[filteredIndex];
    if (!app) return;

    currentAppId = app.id;

    document.getElementById("modalDetails").innerHTML = `
      <p><strong>Employee ID:</strong> ${app.employeeId}</p>
      <p><strong>Name:</strong> ${app.employeeName}</p>
      <p><strong>Start Date:</strong> ${app.startDate}</p>
      <p><strong>End Date:</strong> ${app.endDate}</p>
      <p><strong>Leave Type:</strong> ${app.leaveType}</p>
      <p><strong>Reason:</strong> ${app.reason}</p>
      <p><strong>Status:</strong> ${app.status}</p>
    `;

    const approveBtn = document.getElementById("approveBtn");
    const rejectBtn = document.getElementById("rejectBtn");

    if (app.status !== "Pending") {
      approveBtn.disabled = true;
      rejectBtn.disabled = true;
      approveBtn.style.opacity = "0.5";
      rejectBtn.style.opacity = "0.5";
      approveBtn.title = "Already processed";
      rejectBtn.title = "Already processed";
    } else {
      approveBtn.disabled = false;
      rejectBtn.disabled = false;
      approveBtn.style.opacity = "1";
      rejectBtn.style.opacity = "1";
      approveBtn.title = "";
      rejectBtn.title = "";
    }

    document.getElementById("employeeModal").style.display = "flex";
  }

  // Initial load
  fetchApplications();
});
