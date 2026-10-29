"use strict";

const dashboardRoot = document.querySelector("[data-dashboard]");
const role = dashboardRoot?.dataset.dashboard;
const session = window.ElmirixDemo.getSession();
const profile = window.ElmirixDemo.getProfiles()[role];
const escapeHTML = window.Elmirix.escapeHTML;

function dashboardNotice(message) {
  window.Elmirix.showToast(message);
}

function bindDashboardHeader() {
  document.querySelectorAll("[data-demo-name]").forEach((element) => {
    element.textContent = session?.role === role ? session.name : profile.name;
  });
  document.querySelectorAll("[data-demo-email]").forEach((element) => {
    element.textContent = session?.role === role ? session.email : profile.email;
  });
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
  }
  document.querySelector(".sidebar-overlay")?.addEventListener("click", () => {
    sidebar?.classList.remove("sidebar-open");
    document.body.classList.remove("sidebar-visible");
    toggle?.setAttribute("aria-expanded", "false");
  });
}

function businessCardMarkup(business, action = "") {
  return `<a class="dashboard-business-card" href="business-details.html?id=${encodeURIComponent(business.id)}"><span class="dashboard-business-icon ${escapeHTML(business.color)}"><img src="${escapeHTML(business.imageDataUrl || business.image)}" alt=""></span><span class="dashboard-business-copy"><strong>${escapeHTML(business.name)}</strong><small>${escapeHTML(business.industry)} · ${escapeHTML(business.stage)}</small></span><i class="bi ${action || "bi-arrow-up-right"}" aria-hidden="true"></i></a>`;
}

function renderOwnerDashboard() {
  const business = window.ElmirixDemo.getBusiness(profile.business?.id || "greenharvest");
  if (!business) {
    dashboardRoot.innerHTML = `<section class="dashboard-empty"><h1>Sample business unavailable</h1><p>Reload the page to restore the sample profile.</p></section>`;
    return;
  }
  const hasFinancials = business.revenue !== null && business.operatingExpenses !== null && business.otherExpenses !== null;
  const expenses = hasFinancials ? business.operatingExpenses + business.otherExpenses : null;
  const net = hasFinancials ? business.revenue + (business.otherIncome || 0) - expenses : null;
  const financialRecords = window.ElmirixDemo.getFinancialRecords();
  const fundingRequests = window.ElmirixDemo.getFundingRequests();
  const recordedIncome = financialRecords.filter((record) => record.type === "income").reduce((total, record) => total + record.amount, 0);
  const recordedExpenses = financialRecords.filter((record) => record.type === "expense").reduce((total, record) => total + record.amount, 0);
  const activeRequests = fundingRequests.filter((request) => request.status !== "Closed");
  const completionFields = ["name", "industry", "location", "shortDescription", "mission", "vision", "products", "targetMarket"];
  const completion = Math.round(completionFields.filter((field) => Boolean(business[field])).length / completionFields.length * 100);
  dashboardRoot.innerHTML = `
    <div class="dashboard-welcome"><div><p class="eyebrow">BUSINESS OWNER WORKSPACE</p><h1>Good to see you, <span data-demo-name>${escapeHTML(session?.role === role ? session.name : profile.name)}</span>.</h1><p>Here is a snapshot of your sample business profile.</p></div><a class="btn btn-primary-brand" href="owner-profile.html"><i class="bi bi-pencil-square me-1" aria-hidden="true"></i> Edit profile</a></div>
    <div class="demo-banner"><i class="bi bi-info-circle" aria-hidden="true"></i><span>Owner dashboard demo · Metrics are sample or zero-state values, not live platform activity.</span></div>
    <div class="dashboard-stat-grid">
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i class="bi bi-eye" aria-hidden="true"></i></span><span class="dashboard-stat-label">Profile views</span><strong>—</strong><small>No view tracking in this stage</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i class="bi bi-chat-dots" aria-hidden="true"></i></span><span class="dashboard-stat-label">Inquiries</span><strong>0</strong><small>Inquiry features arrive in Phase 5</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i class="bi bi-cash-stack" aria-hidden="true"></i></span><span class="dashboard-stat-label">Revenue · ${escapeHTML(business.reportingPeriod || "sample period")}</span><strong>${hasFinancials ? window.Elmirix.formatCurrency(business.revenue) : "N/A"}</strong><small>Sample reported revenue</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon burgundy"><i class="bi bi-receipt" aria-hidden="true"></i></span><span class="dashboard-stat-label">Total expenses</span><strong>${hasFinancials ? window.Elmirix.formatCurrency(expenses) : "N/A"}</strong><small>Operating + other expenses</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon ${net !== null && net < 0 ? "warning" : ""}"><i class="bi bi-graph-up-arrow" aria-hidden="true"></i></span><span class="dashboard-stat-label">Net ${net !== null && net < 0 ? "loss" : "profit"}</span><strong>${hasFinancials ? window.Elmirix.formatCurrency(Math.abs(net)) : "N/A"}</strong><small>Revenue + other income − expenses</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon burgundy"><i class="bi bi-bullseye" aria-hidden="true"></i></span><span class="dashboard-stat-label">Sample funding goal</span><strong>${window.Elmirix.formatCurrency(business.fundingTarget)}</strong><small>Not a live fundraising request</small></article>
    </div>
    <div class="dashboard-content-grid">
      <section class="dashboard-panel dashboard-chart-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">CURRENT SAMPLE PERIOD</p><h2>Revenue &amp; expenses</h2></div><span class="panel-tag">${escapeHTML(business.reportingPeriod || "No period reported")}</span></div>${hasFinancials ? `<div class="dashboard-chart-wrap"><canvas id="owner-financial-chart" role="img" aria-label="Sample revenue and total expenses for ${escapeHTML(business.reportingPeriod)}"></canvas></div><p class="chart-caption">This visualization uses the sample financial profile, not verified accounting records.</p>` : `<div class="dashboard-empty-inline"><i class="bi bi-bar-chart" aria-hidden="true"></i><span>Financial data is incomplete for this sample profile.</span></div>`}</section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">PROFILE HEALTH</p><h2>Profile completion</h2></div><i class="bi bi-person-check panel-icon" aria-hidden="true"></i></div><div class="completion-value">${completion}<span>%</span></div><div class="completion-track" role="progressbar" aria-label="Profile completion" aria-valuenow="${completion}" aria-valuemin="0" aria-valuemax="100"><span style="width:${completion}%"></span></div><p class="dashboard-muted">Complete the profile story to help visitors understand your business.</p><a class="text-action" href="owner-profile.html">Review your profile <i class="bi bi-arrow-right" aria-hidden="true"></i></a></section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">SAMPLE LISTING</p><h2>Funding status</h2></div><span class="status-chip">${escapeHTML(business.fundingStatus)}</span></div><p class="dashboard-muted">Your sample funding goal is shown for demonstration. No funds are raised or processed.</p><div class="funding-goal-row"><span>Goal</span><strong>${window.Elmirix.formatCurrency(business.fundingTarget)}</strong></div><a class="text-action" href="business-details.html?id=${encodeURIComponent(business.id)}">Preview public listing <i class="bi bi-arrow-right" aria-hidden="true"></i></a></section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">PHASE 4 · LOCAL DEMO LEDGER</p><h2>Financial records</h2></div><span class="panel-tag">${financialRecords.length} ${financialRecords.length === 1 ? "entry" : "entries"}</span></div><div class="funding-goal-row"><span>Recorded income</span><strong>${window.Elmirix.formatCurrency(recordedIncome)}</strong></div><div class="funding-goal-row"><span>Recorded expenses</span><strong>${window.Elmirix.formatCurrency(recordedExpenses)}</strong></div><p class="dashboard-muted">These user-entered demo records are separate from the sample figures above.</p><a class="text-action" href="financial-tools.html#financial-record-form">Manage financial records <i class="bi bi-arrow-right" aria-hidden="true"></i></a></section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">PHASE 4 · FUNDING PLANNER</p><h2>Funding requests</h2></div><span class="panel-tag">${activeRequests.length} active</span></div><p class="dashboard-muted">${fundingRequests.length ? `${fundingRequests.length} illustrative ${fundingRequests.length === 1 ? "request" : "requests"} saved in this browser.` : "No demo funding requests yet."} Nothing is published or sent to investors.</p><a class="text-action" href="financial-tools.html#funding-request-form">Manage funding requests <i class="bi bi-arrow-right" aria-hidden="true"></i></a></section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">INQUIRY ACTIVITY</p><h2>Recent inquiries</h2></div><i class="bi bi-chat-square panel-icon" aria-hidden="true"></i></div><div class="dashboard-empty-inline"><i class="bi bi-inbox" aria-hidden="true"></i><span>No demo inquiries yet. Inquiry management is planned for Phase 5.</span></div></section>
      <section class="dashboard-panel dashboard-actions-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">YOUR NEXT STEP</p><h2>Quick actions</h2></div></div><div class="dashboard-actions"><a href="owner-profile.html"><i class="bi bi-pencil-square" aria-hidden="true"></i><span>Edit business profile</span><i class="bi bi-arrow-right" aria-hidden="true"></i></a><a href="business-details.html?id=${encodeURIComponent(business.id)}"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i><span>Preview public profile</span><i class="bi bi-arrow-right" aria-hidden="true"></i></a><a href="financial-tools.html#financial-record-form"><i class="bi bi-journal-plus" aria-hidden="true"></i><span>Financial records</span><i class="bi bi-arrow-right" aria-hidden="true"></i></a><a href="financial-tools.html#funding-request-form"><i class="bi bi-bullseye" aria-hidden="true"></i><span>Funding request tools</span><i class="bi bi-arrow-right" aria-hidden="true"></i></a></div></section>
    </div>`;
  if (hasFinancials && window.Chart) {
    new window.Chart(document.querySelector("#owner-financial-chart").getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Revenue", "Total expenses"],
        datasets: [{
          data: [business.revenue, expenses],
          backgroundColor: ["rgba(99,197,245,.78)", "rgba(126,41,74,.78)"],
          borderColor: ["#63c5f5", "#a94c6d"],
          borderWidth: 1,
          borderRadius: 7,
          maxBarThickness: 74
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (context) => window.Elmirix.formatCurrency(context.raw) } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#b8c8dc" }, border: { color: "#263b55" } },
          y: { beginAtZero: true, grid: { color: "rgba(135,154,179,.13)" }, ticks: { color: "#879ab3", callback: (value) => new Intl.NumberFormat("en-PK", { notation: "compact", maximumFractionDigits: 1 }).format(value) }, border: { display: false } }
        }
      }
    });
  }
}

function renderInvestorDashboard() {
  const businesses = window.ELMIRIX_BUSINESSES || [];
  const saved = window.ElmirixDemo.getSavedIds().map((id) => businesses.find((business) => business.id === id)).filter(Boolean);
  const viewed = window.ElmirixDemo.getViewedIds().map((id) => window.ElmirixDemo.getBusiness(id)).filter(Boolean);
  const investor = window.ElmirixDemo.getProfiles().investor;
  const recommended = businesses.map((business) => window.ElmirixDemo.getBusiness(business.id))
    .filter((business) => (!investor.industries?.length || investor.industries.includes(business.industry))
      && (!investor.stages?.length || investor.stages.includes(business.stage))
      && (!investor.locations?.length || investor.locations.includes(business.location))
      && (investor.minInvestment === "" || business.fundingTarget >= Number(investor.minInvestment))
      && (investor.maxInvestment === "" || business.fundingTarget <= Number(investor.maxInvestment)))
    .slice(0, 3);
  const showBusinesses = (list, emptyMessage) => list.length
    ? list.map((business) => businessCardMarkup(business)).join("")
    : `<div class="dashboard-empty-inline"><i class="bi bi-inbox" aria-hidden="true"></i><span>${emptyMessage}</span></div>`;

  dashboardRoot.innerHTML = `
    <div class="dashboard-welcome"><div><p class="eyebrow">INVESTOR WORKSPACE</p><h1>Welcome, <span data-demo-name>${escapeHTML(session?.role === role ? session.name : investor.name)}</span>.</h1><p>Explore sample businesses and save the ones you want to revisit.</p></div><a class="btn btn-primary-brand" href="explore.html"><i class="bi bi-compass me-1" aria-hidden="true"></i> Explore businesses</a></div>
    <div class="demo-banner"><i class="bi bi-info-circle" aria-hidden="true"></i><span>Investor dashboard demo · Recommendations use sample profile preferences; no real investor activity is represented.</span></div>
    <div class="dashboard-stat-grid investor-stats">
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i class="bi bi-bookmark" aria-hidden="true"></i></span><span class="dashboard-stat-label">Saved businesses</span><strong>${saved.length}</strong><small>Saved in this browser</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i class="bi bi-chat-dots" aria-hidden="true"></i></span><span class="dashboard-stat-label">Total inquiries</span><strong>0</strong><small>Inquiry tools arrive in Phase 5</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon burgundy"><i class="bi bi-hourglass-split" aria-hidden="true"></i></span><span class="dashboard-stat-label">Awaiting a response</span><strong>0</strong><small>No demo inquiries</small></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i class="bi bi-clock-history" aria-hidden="true"></i></span><span class="dashboard-stat-label">Recently viewed</span><strong>${viewed.length}</strong><small>Profiles viewed in this browser</small></article>
    </div>
    <div class="dashboard-content-grid investor-dashboard-grid">
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">SAVED FOR LATER</p><h2>Saved businesses</h2></div><a class="text-action" href="explore.html">Browse all <i class="bi bi-arrow-right" aria-hidden="true"></i></a></div><div class="dashboard-business-list">${showBusinesses(saved, "No saved businesses yet. Browse the directory and bookmark a profile.")}</div></section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">BASED ON YOUR PREFERENCES</p><h2>Suggested businesses</h2></div><span class="panel-tag">Demo suggestions</span></div><div class="dashboard-business-list">${showBusinesses(recommended, "No suggestions match your preferences. Update your investor profile.")}</div><p class="dashboard-muted">Suggestions use sample profile preferences—not artificial intelligence or real investor data.</p></section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">RECENTLY OPENED</p><h2>Recently viewed</h2></div></div><div class="dashboard-business-list">${showBusinesses(viewed, "Business profiles you open will appear here in this browser.")}</div></section>
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">INQUIRY TRACKER</p><h2>Recent inquiries</h2></div></div><div class="dashboard-empty-inline"><i class="bi bi-chat-square-text" aria-hidden="true"></i><span>No demo inquiries yet. Inquiry tracking is planned for Phase 5.</span></div></section>
      <section class="dashboard-panel dashboard-actions-panel"><div class="dashboard-panel-heading"><div><p class="eyebrow">YOUR WORKSPACE</p><h2>Quick actions</h2></div></div><div class="dashboard-actions"><a href="explore.html"><i class="bi bi-search" aria-hidden="true"></i><span>Explore businesses</span><i class="bi bi-arrow-right" aria-hidden="true"></i></a><a href="investor-dashboard.html#saved-businesses" data-scroll-saved><i class="bi bi-bookmark" aria-hidden="true"></i><span>Review saved businesses</span><i class="bi bi-arrow-right" aria-hidden="true"></i></a><a href="investor-profile.html"><i class="bi bi-person-gear" aria-hidden="true"></i><span>Edit investor profile</span><i class="bi bi-arrow-right" aria-hidden="true"></i></a><button type="button" data-coming-soon="Investor inquiry tracking will be added in Phase 5."><i class="bi bi-chat-left-text" aria-hidden="true"></i><span>Inquiry tracking</span><i class="bi bi-arrow-right" aria-hidden="true"></i></button></div></section>
    </div>`;
  const savedPanel = dashboardRoot.querySelector(".investor-dashboard-grid .dashboard-panel");
  if (savedPanel) savedPanel.id = "saved-businesses";
  dashboardRoot.querySelector("[data-scroll-saved]")?.addEventListener("click", (event) => {
    event.preventDefault();
    savedPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (!role || !["owner", "investor"].includes(role)) {
  throw new Error("Dashboard page is missing a valid demo role.");
}

bindDashboardHeader();
if (role === "owner") renderOwnerDashboard();
if (role === "investor") renderInvestorDashboard();

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-coming-soon]");
  if (button) dashboardNotice(button.dataset.comingSoon);
});

window.addEventListener("elmirix:profiles-changed", () => window.location.reload());
