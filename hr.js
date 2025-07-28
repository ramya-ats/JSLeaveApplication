let currentAppIndex = null;
function closeModal() {
    document.getElementById("employeeModal").style.display = "none";
    currentAppIndex = null;
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

    let applications = JSON.parse(localStorage.getItem("leaveApplications")) || [];
    let filteredApplications = [...applications];

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
                <td>
                    <button onclick="viewApplication(${index})">View</button>
                </td>
            `;
            tableBody.appendChild(row);
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

    clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all records?")) {
            localStorage.removeItem("leaveApplications");
            location.reload();
        }
    });

    renderTable(applications);
    updateSummaries();

    // Approve and Reject buttons
    document.getElementById("approveBtn").addEventListener("click", () => {
        updateStatus("Approved");
    });

    document.getElementById("rejectBtn").addEventListener("click", () => {
        updateStatus("Rejected");
    });

    function updateStatus(newStatus) {
        if (currentAppIndex !== null) {
            const originalIndex = applications.findIndex(app => 
                app.employeeId === filteredApplications[currentAppIndex].employeeId &&
                app.startDate === filteredApplications[currentAppIndex].startDate
            );

            if (originalIndex !== -1) {
                applications[originalIndex].status = newStatus;
                localStorage.setItem("leaveApplications", JSON.stringify(applications));
                closeModal();
                filterApplications(); // refresh table with filters
                updateSummaries();
            }
        }
    }
});

// View button opens modal and populates info
function viewApplication(filteredIndex) {
    const allApps = JSON.parse(localStorage.getItem("leaveApplications")) || [];
    const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;

    const filtered = allApps.filter(app => {
        const matchesSearch =
            app.employeeName.toLowerCase().includes(searchInput) ||
            app.employeeId.toLowerCase().includes(searchValue);
        const matchesStatus = statusFilter === "All" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const app = filtered[filteredIndex];
    if (!app) return;

    currentAppIndex = filteredIndex;

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

    // Enable or disable buttons based on status
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