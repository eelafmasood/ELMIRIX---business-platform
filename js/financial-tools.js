"use strict";

(() => {
  const root = document.querySelector("[data-financial-tools]");
  const records = window.ElmirixDemo.getFinancialRecords();
  const requests = window.ElmirixDemo.getFundingRequests();
  const recordForm = document.querySelector("#financial-record-form");
  const requestForm = document.querySelector("#funding-request-form");
  const recordList = document.querySelector("#financial-record-list");
  const requestList = document.querySelector("#funding-request-list");
  const message = document.querySelector("#financial-tools-message");
  const profile = window.ElmirixDemo.getProfiles().owner;
  const escapeHTML = window.Elmirix.escapeHTML;
  const formatCurrency = window.Elmirix.formatCurrency;
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function showMessage(text, kind = "success") {
    message.textContent = text;
    message.className = `profile-message financial-tools-message profile-message-${kind}`;
    message.hidden = false;
  }

  function displayDate(value) {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(parsed);
  }

  function renderRecords() {
    const income = records.filter((record) => record.type === "income");
    const expenses = records.filter((record) => record.type === "expense");
    const totalIncome = income.reduce((total, record) => total + record.amount, 0);
    const totalExpenses = expenses.reduce((total, record) => total + record.amount, 0);
    document.querySelector("[data-total-income]").textContent = formatCurrency(totalIncome);
    document.querySelector("[data-total-expenses]").textContent = formatCurrency(totalExpenses);
    document.querySelector("[data-total-net]").textContent = formatCurrency(totalIncome - totalExpenses);
    document.querySelector("[data-income-count]").textContent = `${income.length} demo ${income.length === 1 ? "entry" : "entries"}`;
    document.querySelector("[data-expense-count]").textContent = `${expenses.length} demo ${expenses.length === 1 ? "entry" : "entries"}`;
    document.querySelector("[data-record-count]").textContent = `${records.length} ${records.length === 1 ? "entry" : "entries"}`;

    if (!records.length) {
      recordList.innerHTML = `<div class="dashboard-empty-inline"><i class="bi bi-journal" aria-hidden="true"></i><span>No records yet. Add an income or expense entry to populate this demo ledger.</span></div>`;
      return;
    }

    recordList.innerHTML = [...records]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .map((record) => `<article class="financial-record-item">
        <div class="financial-record-main"><span class="financial-record-type ${record.type === "income" ? "income" : "expense"}">${record.type === "income" ? "Income" : "Expense"}</span><strong>${escapeHTML(record.description)}</strong><small>${escapeHTML(record.category)} · ${escapeHTML(displayDate(record.date))}</small>${record.notes ? `<p>${escapeHTML(record.notes)}</p>` : ""}</div>
        <div class="financial-record-side"><strong>${formatCurrency(record.amount)}</strong><div><button class="financial-icon-button" type="button" data-edit-record="${escapeHTML(record.id)}" aria-label="Edit ${escapeHTML(record.description)}"><i class="bi bi-pencil" aria-hidden="true"></i></button><button class="financial-icon-button danger" type="button" data-delete-record="${escapeHTML(record.id)}" aria-label="Delete ${escapeHTML(record.description)}"><i class="bi bi-trash3" aria-hidden="true"></i></button></div></div>
      </article>`).join("");
  }

  function renderRequests() {
    document.querySelector("[data-request-count]").textContent = `${requests.length} ${requests.length === 1 ? "request" : "requests"}`;
    if (!requests.length) {
      requestList.innerHTML = `<div class="dashboard-empty-inline"><i class="bi bi-bullseye" aria-hidden="true"></i><span>No funding requests yet. Create a draft to organize an illustrative funding goal.</span></div>`;
      return;
    }

    requestList.innerHTML = [...requests]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((request) => `<article class="funding-request-item">
        <div class="dashboard-panel-heading"><div><span class="request-status-chip">${escapeHTML(request.status)}</span><h3>${escapeHTML(request.title)}</h3></div><strong>${formatCurrency(request.amount)}</strong></div>
        <p>${escapeHTML(request.purpose)}</p>${request.useOfFunds ? `<p class="request-use-of-funds"><strong>Illustrative use:</strong> ${escapeHTML(request.useOfFunds)}</p>` : ""}
        <div class="financial-form-actions"><button class="btn btn-secondary-brand btn-sm" type="button" data-edit-request="${escapeHTML(request.id)}"><i class="bi bi-pencil me-1" aria-hidden="true"></i>Edit</button><button class="btn btn-secondary-brand btn-sm" type="button" data-delete-request="${escapeHTML(request.id)}"><i class="bi bi-trash3 me-1" aria-hidden="true"></i>Delete</button></div>
      </article>`).join("");
  }

  function resetRecordForm() {
    recordForm.reset();
    recordForm.elements.namedItem("recordId").value = "";
    recordForm.elements.namedItem("date").value = localToday;
    recordForm.classList.remove("was-validated");
    document.querySelector("#record-form-heading").textContent = "Add a financial record";
    document.querySelector("[data-record-submit]").textContent = "Add record";
    document.querySelector("[data-record-cancel]").hidden = true;
  }

  function resetRequestForm() {
    requestForm.reset();
    requestForm.elements.namedItem("requestId").value = "";
    requestForm.classList.remove("was-validated");
    document.querySelector("#funding-form-heading").textContent = "Create a funding request";
    document.querySelector("[data-request-submit]").textContent = "Create demo request";
    document.querySelector("[data-request-cancel]").hidden = true;
  }

  function editRecord(id) {
    const record = records.find((item) => item.id === id);
    if (!record) return;
    recordForm.elements.namedItem("recordId").value = record.id;
    recordForm.elements.namedItem("type").value = record.type;
    recordForm.elements.namedItem("category").value = record.category;
    recordForm.elements.namedItem("description").value = record.description;
    recordForm.elements.namedItem("amount").value = String(record.amount);
    recordForm.elements.namedItem("date").value = record.date;
    recordForm.elements.namedItem("notes").value = record.notes;
    document.querySelector("#record-form-heading").textContent = "Edit financial record";
    document.querySelector("[data-record-submit]").textContent = "Save changes";
    document.querySelector("[data-record-cancel]").hidden = false;
    recordForm.scrollIntoView({ behavior: "smooth", block: "start" });
    recordForm.elements.namedItem("description").focus({ preventScroll: true });
  }

  function editRequest(id) {
    const request = requests.find((item) => item.id === id);
    if (!request) return;
    requestForm.elements.namedItem("requestId").value = request.id;
    requestForm.elements.namedItem("title").value = request.title;
    requestForm.elements.namedItem("amount").value = String(request.amount);
    requestForm.elements.namedItem("purpose").value = request.purpose;
    requestForm.elements.namedItem("useOfFunds").value = request.useOfFunds;
    requestForm.elements.namedItem("status").value = request.status;
    document.querySelector("#funding-form-heading").textContent = "Edit funding request";
    document.querySelector("[data-request-submit]").textContent = "Save changes";
    document.querySelector("[data-request-cancel]").hidden = false;
    requestForm.scrollIntoView({ behavior: "smooth", block: "start" });
    requestForm.elements.namedItem("title").focus({ preventScroll: true });
  }

  if (!root || !profile || !recordForm || !requestForm || !recordList || !requestList || !message) {
    throw new Error("Financial tools page is missing required demo controls.");
  }

  document.querySelectorAll("[data-demo-name]").forEach((element) => { element.textContent = profile.name; });
  document.querySelectorAll("[data-demo-email]").forEach((element) => { element.textContent = profile.email; });
  recordForm.elements.namedItem("date").value = localToday;
  renderRecords();
  renderRequests();

  for (const form of [recordForm, requestForm]) {
    form.addEventListener("input", (event) => {
      if (event.target.matches("input, textarea, select") && event.target.checkValidity()) {
        event.target.classList.remove("is-invalid");
      }
    });
    form.addEventListener("invalid", (event) => {
      if (event.target.matches("input, textarea, select")) event.target.classList.add("is-invalid");
    }, true);
  }

  recordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    recordForm.classList.add("was-validated");
    if (!recordForm.checkValidity()) {
      recordForm.querySelector(":invalid")?.focus();
      return;
    }

    const id = recordForm.elements.namedItem("recordId").value;
    const record = {
      id: id || makeId(),
      type: recordForm.elements.namedItem("type").value,
      category: recordForm.elements.namedItem("category").value,
      description: recordForm.elements.namedItem("description").value.trim(),
      amount: Number(recordForm.elements.namedItem("amount").value),
      date: recordForm.elements.namedItem("date").value,
      notes: recordForm.elements.namedItem("notes").value.trim()
    };
    const index = records.findIndex((item) => item.id === id);
    if (index >= 0) records[index] = record;
    else records.push(record);
    if (!window.ElmirixDemo.saveFinancialRecords(records)) {
      if (index >= 0) records[index] = window.ElmirixDemo.getFinancialRecords().find((item) => item.id === id) || records[index];
      else records.pop();
      showMessage("The record could not be saved. Check this browser's local storage settings.", "error");
      return;
    }
    resetRecordForm();
    renderRecords();
    showMessage(index >= 0 ? "Financial record updated in this browser." : "Financial record added to this browser.");
  });

  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    requestForm.classList.add("was-validated");
    if (!requestForm.checkValidity()) {
      requestForm.querySelector(":invalid")?.focus();
      return;
    }

    const id = requestForm.elements.namedItem("requestId").value;
    const existing = requests.find((item) => item.id === id);
    const request = {
      id: id || makeId(),
      title: requestForm.elements.namedItem("title").value.trim(),
      amount: Number(requestForm.elements.namedItem("amount").value),
      purpose: requestForm.elements.namedItem("purpose").value.trim(),
      useOfFunds: requestForm.elements.namedItem("useOfFunds").value.trim(),
      status: requestForm.elements.namedItem("status").value,
      createdAt: existing?.createdAt || new Date().toISOString()
    };
    const index = requests.findIndex((item) => item.id === id);
    if (index >= 0) requests[index] = request;
    else requests.push(request);
    if (!window.ElmirixDemo.saveFundingRequests(requests)) {
      if (index >= 0) requests[index] = existing;
      else requests.pop();
      showMessage("The funding request could not be saved. Check this browser's local storage settings.", "error");
      return;
    }
    resetRequestForm();
    renderRequests();
    showMessage(index >= 0 ? "Funding request updated in this browser." : "Demo funding request created in this browser.");
  });

  recordList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-record]");
    if (editButton) {
      editRecord(editButton.dataset.editRecord);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-record]");
    if (!deleteButton) return;
    const index = records.findIndex((record) => record.id === deleteButton.dataset.deleteRecord);
    if (index < 0 || !window.confirm("Delete this demo financial record?")) return;
    const [removed] = records.splice(index, 1);
    if (!window.ElmirixDemo.saveFinancialRecords(records)) {
      records.splice(index, 0, removed);
      showMessage("The record could not be deleted. Check this browser's local storage settings.", "error");
      return;
    }
    renderRecords();
    showMessage("Financial record deleted from this browser.", "info");
  });

  requestList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-request]");
    if (editButton) {
      editRequest(editButton.dataset.editRequest);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-request]");
    if (!deleteButton) return;
    const index = requests.findIndex((request) => request.id === deleteButton.dataset.deleteRequest);
    if (index < 0 || !window.confirm("Delete this demo funding request?")) return;
    const [removed] = requests.splice(index, 1);
    if (!window.ElmirixDemo.saveFundingRequests(requests)) {
      requests.splice(index, 0, removed);
      showMessage("The funding request could not be deleted. Check this browser's local storage settings.", "error");
      return;
    }
    renderRequests();
    showMessage("Funding request deleted from this browser.", "info");
  });

  document.querySelector("[data-record-cancel]").addEventListener("click", resetRecordForm);
  document.querySelector("[data-request-cancel]").addEventListener("click", resetRequestForm);
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      window.ElmirixDemo.clearSession();
      window.location.assign("login.html");
    });
  });
  const toggle = document.querySelector("[data-sidebar-toggle]");
  const sidebar = document.querySelector("#dashboard-sidebar");
  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("sidebar-open");
      document.body.classList.toggle("sidebar-visible", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close dashboard navigation" : "Open dashboard navigation");
    });
    sidebar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("sidebar-open");
        document.body.classList.remove("sidebar-visible");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.querySelector(".sidebar-overlay")?.addEventListener("click", () => {
      sidebar.classList.remove("sidebar-open");
      document.body.classList.remove("sidebar-visible");
      toggle.setAttribute("aria-expanded", "false");
    });
  }
})();
