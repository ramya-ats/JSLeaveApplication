document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("employeeForm");

  const employeeNameInput = document.getElementById("employeeName");
  const employeeIdInput = document.getElementById("employeeId");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const leaveTypeInput = document.getElementById("leaveType");
  const reasonInput = document.getElementById("reason");

  const nameError = document.getElementById("error-message");
  const idError = document.getElementById("employeeId-error");
  const startDateError = document.getElementById("startDate-error");
  const endDateError = document.getElementById("endDate-error");
  const leaveTypeError = document.getElementById("leaveType-error");
  const reasonError = document.getElementById("reason-error");

  const namePattern = /^[A-Za-z ]{5,30}$/;
  const idPattern = /^ATS(?!0000)\d{4}$/;

  const today = new Date().toISOString().split("T")[0];
  startDateInput.setAttribute("min", today);
  endDateInput.setAttribute("min", today);

  // Employee Name Validation
  employeeNameInput.addEventListener("input", () => {
    employeeNameInput.value = employeeNameInput.value.replace(/[^A-Za-z ]/g, "");

    if (employeeNameInput.value.length > 30) {
      employeeNameInput.value = employeeNameInput.value.slice(0, 30);
      nameError.textContent = "Maximum 30 characters allowed.";
      employeeNameInput.classList.add("input-error");
    } else if (employeeNameInput.value.length < 5) {
      nameError.textContent = "Minimum 5 characters required.";
      employeeNameInput.classList.add("input-error");
    } else {
      nameError.textContent = "";
      employeeNameInput.classList.remove("input-error");
    }
  });

  // Employee ID Validation
  employeeIdInput.addEventListener("input", () => {
    let val = employeeIdInput.value.toUpperCase();

    if (!val.startsWith("ATS")) {
      const index = val.indexOf("ATS");
      val = index !== -1 ? val.slice(index) : "ATS";
    }

    let digits = val.slice(3).replace(/\D/g, "").slice(0, 4);
    employeeIdInput.value = "ATS" + digits;

    if (employeeIdInput.value.length !== 7) {
      idError.textContent = "Employee ID must be exactly 7 characters.";
      employeeIdInput.classList.add("input-error");
    } else if (!idPattern.test(employeeIdInput.value)) {
      idError.textContent = "ID must start with 'ATS' and not be ATS0000.";
      employeeIdInput.classList.add("input-error");
    } else {
      idError.textContent = "";
      employeeIdInput.classList.remove("input-error");
    }
  });

  // Start Date & End Date Logic
  startDateInput.addEventListener("input", () => {
    const startDateValue = startDateInput.value;
    if (!startDateValue) {
      startDateError.textContent = "Please select a start date.";
      startDateInput.classList.add("input-error");
      return;
    }

    const startDate = new Date(startDateValue);
    const maxEndDate = new Date(startDate);
    maxEndDate.setFullYear(startDate.getFullYear() + 2);

    endDateInput.setAttribute("min", startDateValue);
    endDateInput.setAttribute("max", maxEndDate.toISOString().split("T")[0]);

    startDateError.textContent = "";
    startDateInput.classList.remove("input-error");

    const endDate = new Date(endDateInput.value);
    if (endDateInput.value && (endDate < startDate || endDate > maxEndDate)) {
      endDateError.textContent = "End date must be within 2 years from start.";
      endDateInput.classList.add("input-error");
    } else {
      endDateError.textContent = "";
      endDateInput.classList.remove("input-error");
    }
  });

  endDateInput.addEventListener("input", () => {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const maxEndDate = new Date(startDate);
    maxEndDate.setFullYear(startDate.getFullYear() + 2);

    if (!endDateInput.value) {
      endDateError.textContent = "Please select an end date.";
      endDateInput.classList.add("input-error");
    } else if (endDate < startDate || endDate > maxEndDate) {
      endDateError.textContent = "End date must be within 2 years from start.";
      endDateInput.classList.add("input-error");
    } else {
      endDateError.textContent = "";
      endDateInput.classList.remove("input-error");
    }
  });

  // Leave Type
  leaveTypeInput.addEventListener("input", () => {
    if (!leaveTypeInput.value) {
      leaveTypeError.textContent = "Please select a leave type.";
      leaveTypeInput.classList.add("input-error");
    } else {
      leaveTypeError.textContent = "";
      leaveTypeInput.classList.remove("input-error");
    }
  });

  // Reason Validation (non-space characters only)
  reasonInput.addEventListener("input", () => {
    const raw = reasonInput.value;
    const nonSpaceLength = raw.replace(/\s/g, "").length;

    if (nonSpaceLength > 300) {
      // Keep trimming until under 300 non-space characters
      let trimmed = "";
      let count = 0;
      for (let i = 0; i < raw.length; i++) {
        if (raw[i] !== " ") count++;
        if (count > 300) break;
        trimmed += raw[i];
      }
      reasonInput.value = trimmed;
      reasonError.textContent = "Maximum 300 non-space characters allowed.";
      reasonInput.classList.add("input-error");
    } else if (nonSpaceLength < 5) {
      reasonError.textContent = "Minimum 5 non-space characters required.";
      reasonInput.classList.add("input-error");
    } else {
      reasonError.textContent = "";
      reasonInput.classList.remove("input-error");
    }
  });

  // Form Submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let hasError = false;

    const nameValue = employeeNameInput.value.trim();
    const idValue = employeeIdInput.value.trim();
    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;
    const leaveTypeValue = leaveTypeInput.value;
    const reasonValue = reasonInput.value.trim();
    const reasonNonSpaceLength = reasonValue.replace(/\s/g, "").length;

    if (!namePattern.test(nameValue)) {
      nameError.textContent = "Name must be 5–30 letters/spaces.";
      employeeNameInput.classList.add("input-error");
      hasError = true;
    }

    if (!idPattern.test(idValue) || idValue.length !== 7) {
      idError.textContent = "ID must be ATS + 4 digits (not ATS0000).";
      employeeIdInput.classList.add("input-error");
      hasError = true;
    }

    if (!startDateValue) {
      startDateError.textContent = "Start date required.";
      startDateInput.classList.add("input-error");
      hasError = true;
    }

    if (!endDateValue) {
      endDateError.textContent = "End date required.";
      endDateInput.classList.add("input-error");
      hasError = true;
    } else {
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);
      const maxEnd = new Date(start);
      maxEnd.setFullYear(start.getFullYear() + 2);
      if (end < start || end > maxEnd) {
        endDateError.textContent = "End date must be within 2 years from start.";
        endDateInput.classList.add("input-error");
        hasError = true;
      }
    }

    if (!leaveTypeValue) {
      leaveTypeError.textContent = "Select a leave type.";
      leaveTypeInput.classList.add("input-error");
      hasError = true;
    }

    if (reasonNonSpaceLength < 5 || reasonNonSpaceLength > 300) {
      reasonError.textContent = "Reason must be 5–300 non-space characters.";
      reasonInput.classList.add("input-error");
      hasError = true;
    }

    if (hasError) return;

    // Save valid form
    const leaveApplication = {
      employeeName: nameValue,
      employeeId: idValue,
      startDate: startDateValue,
      endDate: endDateValue,
      leaveType: leaveTypeValue,
      reason: reasonValue,
      status: "Pending",
    };

    const applications = JSON.parse(localStorage.getItem("leaveApplications")) || [];
    applications.push(leaveApplication);
    localStorage.setItem("leaveApplications", JSON.stringify(applications));

    alert("Leave request submitted successfully!");
    form.reset();

    [nameError, idError, startDateError, endDateError, leaveTypeError, reasonError].forEach(e => e.textContent = '');
    [employeeNameInput, employeeIdInput, startDateInput, endDateInput, leaveTypeInput, reasonInput]
      .forEach(input => input.classList.remove("input-error"));
  });
});