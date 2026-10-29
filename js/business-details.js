"use strict";

const detailRoot = document.querySelector("#business-detail");
const requestedId = new URLSearchParams(window.location.search).get("id");
const business = window.ElmirixDemo.getBusiness(requestedId);
const escapeHTML = window.Elmirix.escapeHTML;

function renderDetail(item) {
  if (!item) {
    detailRoot.innerHTML = `<div class="container"><div class="empty-state detail-empty"><div class="empty-state-icon"><i class="bi bi-building" aria-hidden="true"></i></div><h1>Business profile not found</h1><p>Choose a sample profile from the business directory.</p><a class="btn btn-primary-brand" href="explore.html">Explore businesses</a></div></div>`;
    document.title = "Business Not Found | Elmirix";
    return;
  }

  window.ElmirixDemo.recordViewed(item.id);
  document.title = `${item.name} | Elmirix`;
  const saved = window.Elmirix.isSaved(item.id);
  const hasFinancials = item.revenue !== null && item.operatingExpenses !== null && item.otherExpenses !== null && item.otherIncome !== null;
  const totalExpenses = hasFinancials ? item.operatingExpenses + item.otherExpenses : null;
  const net = hasFinancials ? item.revenue + item.otherIncome - totalExpenses : null;
  const margin = hasFinancials && item.revenue !== 0 ? (net / item.revenue) * 100 : null;
  const financialBlock = hasFinancials ? `
    <div class="financial-grid">
      <div class="financial-metric"><span>Revenue · ${escapeHTML(item.reportingPeriod)}</span><strong>${window.Elmirix.formatCurrency(item.revenue)}</strong><small>Reported revenue</small></div>
      <div class="financial-metric"><span>Total expenses</span><strong>${window.Elmirix.formatCurrency(totalExpenses)}</strong><small>Operating + other expenses</small></div>
      <div class="financial-metric"><span>Net ${net < 0 ? "loss" : "profit"}</span><strong class="${net < 0 ? "negative-number" : "positive-number"}">${window.Elmirix.formatCurrency(Math.abs(net))}</strong><small>Revenue + other income − expenses</small></div>
      <div class="financial-metric"><span>Profit margin</span><strong>${margin === null ? "N/A" : `${margin.toFixed(1)}%`}</strong><small>Calculated from sample figures</small></div>
    </div>` : `<div class="financial-unavailable"><i class="bi bi-info-circle" aria-hidden="true"></i><div><strong>Financial information is not available for this sample.</strong><p>No revenue or expense figures have been provided; totals are not estimated.</p></div></div>`;
  const risks = item.risks.map((risk) => `<li>${escapeHTML(risk)}</li>`).join("");
  const milestones = item.milestones.map((milestone) => `<li><i class="bi bi-check2-circle" aria-hidden="true"></i>${escapeHTML(milestone)}</li>`).join("");

  detailRoot.innerHTML = `
    <div class="container">
      <div class="breadcrumb-line"><a href="index.html">Home</a><i class="bi bi-chevron-right" aria-hidden="true"></i><a href="explore.html">Explore Businesses</a><i class="bi bi-chevron-right" aria-hidden="true"></i><span>${escapeHTML(item.name)}</span></div>
      <div class="detail-disclosure"><i class="bi bi-info-circle" aria-hidden="true"></i><span>Financial information is sample or owner-submitted data and has not been independently verified by Elmirix. This is not an investment offer.</span></div>
      <div class="detail-hero">
        <div class="detail-cover ${escapeHTML(item.color)}"><img src="${escapeHTML(item.imageDataUrl || item.image)}" alt=""><span>${escapeHTML(item.industry)}</span></div>
        <div class="detail-title-row"><div><p class="eyebrow">SAMPLE BUSINESS PROFILE</p><h1>${escapeHTML(item.name)}</h1><div class="detail-meta"><span><i class="bi bi-geo-alt" aria-hidden="true"></i>${escapeHTML(item.location)}</span><span><i class="bi bi-calendar3" aria-hidden="true"></i>Founded ${escapeHTML(item.foundingYear)}</span><span class="stage-pill">${escapeHTML(item.stage)}</span></div></div><button class="btn btn-secondary-brand detail-save" type="button" data-bookmark="${escapeHTML(item.id)}" data-bookmark-name="${escapeHTML(item.name)}" aria-pressed="${saved}"><i class="bi ${saved ? "bi-bookmark-fill" : "bi-bookmark"}" aria-hidden="true"></i><span>${saved ? "Saved" : "Save business"}</span></button></div>
        <p class="detail-lead">${escapeHTML(item.description)}</p>
      </div>
      <div class="detail-layout">
        <div class="detail-main">
          <section class="detail-panel"><p class="eyebrow">THE BUSINESS</p><h2>Overview</h2><p>${escapeHTML(item.mission)}</p><div class="story-grid"><div><span>Mission</span><p>${escapeHTML(item.mission)}</p></div><div><span>Vision</span><p>${escapeHTML(item.vision)}</p></div><div><span>Products &amp; services</span><p>${escapeHTML(item.products)}</p></div><div><span>Target market</span><p>${escapeHTML(item.targetMarket)}</p></div><div><span>Business model</span><p>${escapeHTML(item.businessModel)}</p></div><div><span>Competitive advantage</span><p>${escapeHTML(item.advantage)}</p></div><div><span>Growth strategy</span><p>${escapeHTML(item.growthStrategy)}</p></div></div></section>
          <section class="detail-panel"><p class="eyebrow">AVAILABLE INFORMATION</p><h2>Financial summary</h2><p class="panel-intro">All amounts are shown in PKR. These sample figures are not audited or independently verified.</p>${financialBlock}${hasFinancials ? `<div class="detail-chart-wrap"><canvas id="financial-chart" role="img" aria-label="Bar chart comparing sample revenue and total expenses for ${escapeHTML(item.reportingPeriod)}"></canvas><p class="chart-caption">Revenue and total expenses · ${escapeHTML(item.reportingPeriod)}</p></div>` : ""}</section>
          <section class="detail-panel"><p class="eyebrow">MILESTONES &amp; CONSIDERATIONS</p><h2>Progress and potential risks</h2><div class="milestone-risk-grid"><div><h3>Sample milestones</h3><ul class="detail-list milestone-list">${milestones}</ul></div><div><h3>Considerations</h3><ul class="detail-list risk-list">${risks}</ul></div></div></section>
        </div>
        <aside class="detail-aside"><div class="detail-panel funding-panel"><p class="eyebrow">FUNDING GOAL</p><div class="funding-amount">${window.Elmirix.formatCurrency(item.fundingTarget)}</div><span class="funding-caption">Sample target · not a live fundraising request</span><div class="funding-status"><span class="status-dot"></span>${escapeHTML(item.fundingStatus)}</div><div class="funding-purpose"><span>Purpose</span><p>${escapeHTML(item.fundingPurpose)}</p><span>Illustrative use of funds</span><p>${escapeHTML(item.useOfFunds)}</p></div><div class="aside-divider"></div><div class="aside-fact"><span>Industry</span><strong>${escapeHTML(item.industry)}</strong></div><div class="aside-fact"><span>Business stage</span><strong>${escapeHTML(item.stage)}</strong></div><div class="aside-fact"><span>Reporting period</span><strong>${escapeHTML(item.reportingPeriod || "Not available")}</strong></div><button class="btn btn-primary-brand w-100 mt-4" type="button" data-inquiry>Send an inquiry <i class="bi bi-arrow-up-right ms-1" aria-hidden="true"></i></button><p class="inquiry-note">Funding goals and terms are illustrative only; no fundraising transaction or legally binding offer is made.</p><p class="inquiry-note">Contact functionality is simulated in this frontend demonstration.</p></div></aside>
      </div>
      <div class="detail-bottom-cta"><div><h2>Curious about this idea?</h2><p>Use the demo inquiry form to preview how an introduction could work.</p></div><button class="btn btn-primary-brand" type="button" data-inquiry>Start a conversation <i class="bi bi-arrow-up-right ms-1" aria-hidden="true"></i></button></div>
    </div>
    <dialog class="preview-dialog inquiry-dialog" id="inquiry-dialog" aria-labelledby="inquiry-title"><div class="dialog-content"><button class="icon-button dialog-close" type="button" aria-label="Close dialog" data-close-dialog><i class="bi bi-x-lg" aria-hidden="true"></i></button><p class="eyebrow">PHASE 5 · DEMO INQUIRY</p><h2 id="inquiry-title">Connect with ${escapeHTML(item.name)}</h2><p>This message is saved only in this browser for the owner and investor dashboard demo. It is not sent to anyone.</p><form id="inquiry-form" novalidate><div class="mb-3"><label class="form-label" for="inquiry-name">Your name</label><input class="form-control form-control-brand" id="inquiry-name" name="name" type="text" minlength="2" maxlength="80" autocomplete="name" required><div class="invalid-feedback">Enter your name.</div></div><div class="mb-3"><label class="form-label" for="inquiry-email">Your email</label><input class="form-control form-control-brand" id="inquiry-email" name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@example.com" required><div class="invalid-feedback">Enter a valid email address.</div></div><div class="mb-3"><label class="form-label" for="inquiry-message">Message</label><textarea class="form-control form-control-brand" id="inquiry-message" name="message" rows="4" minlength="10" maxlength="1000" placeholder="Share what you would like to discuss…" required></textarea><div class="invalid-feedback">Write at least 10 characters.</div></div><button class="btn btn-primary-brand w-100" type="submit">Save demo inquiry <i class="bi bi-send ms-1" aria-hidden="true"></i></button></form></div></dialog>`;

  if (hasFinancials && window.Chart) {
    const chartContext = document.querySelector("#financial-chart").getContext("2d");
    new window.Chart(chartContext, {
      type: "bar",
      data: {
        labels: ["Revenue", "Total expenses"],
        datasets: [{
          data: [item.revenue, totalExpenses],
          backgroundColor: ["rgba(99, 197, 245, 0.78)", "rgba(126, 41, 74, 0.78)"],
          borderColor: ["#63c5f5", "#a94c6d"],
          borderWidth: 1,
          borderRadius: 7,
          maxBarThickness: 54
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => window.Elmirix.formatCurrency(context.raw)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#b8c8dc", font: { family: "DM Sans", size: 10 } },
            border: { color: "#263b55" }
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(135, 154, 179, 0.13)" },
            ticks: {
              color: "#879ab3",
              callback: (value) => new Intl.NumberFormat("en-PK", { notation: "compact", maximumFractionDigits: 1 }).format(value)
            },
            border: { display: false }
          }
        }
      }
    });
  }

  const inquiryDialog = document.querySelector("#inquiry-dialog");
  const inquiryForm = document.querySelector("#inquiry-form");
  const investorProfile = window.ElmirixDemo.getProfiles().investor;
  const activeSession = window.ElmirixDemo.getSession();
  const inquirySender = activeSession?.role === "investor" ? activeSession : investorProfile;
  document.querySelector("#inquiry-name").value = inquirySender.name;
  document.querySelector("#inquiry-email").value = inquirySender.email;
  document.querySelectorAll("[data-inquiry]").forEach((button) => button.addEventListener("click", () => inquiryDialog.showModal()));
  inquiryDialog.querySelector("[data-close-dialog]").addEventListener("click", () => inquiryDialog.close());
  inquiryDialog.addEventListener("click", (event) => {
    if (event.target === inquiryDialog) inquiryDialog.close();
  });
  inquiryForm.addEventListener("input", (event) => {
    if (event.target.matches("input, textarea") && event.target.checkValidity()) {
      event.target.classList.remove("is-invalid");
    }
  });
  inquiryForm.addEventListener("invalid", (event) => {
    if (event.target.matches("input, textarea")) event.target.classList.add("is-invalid");
  }, true);
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    inquiryForm.classList.add("was-validated");
    if (!inquiryForm.checkValidity()) {
      inquiryForm.querySelector(":invalid")?.focus();
      return;
    }
    const inquiries = window.ElmirixDemo.getInquiries();
    const inquiry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      businessId: item.id,
      businessName: item.name,
      investorName: inquiryForm.elements.name.value.trim(),
      investorEmail: inquiryForm.elements.email.value.trim(),
      message: inquiryForm.elements.message.value.trim(),
      status: "New",
      createdAt: new Date().toISOString()
    };
    if (!window.ElmirixDemo.saveInquiries([inquiry, ...inquiries])) {
      window.Elmirix.showToast("The inquiry could not be saved. Check this browser's local storage settings.");
      return;
    }
    inquiryDialog.close();
    window.Elmirix.showToast("Demo inquiry saved locally. Nothing was sent.");
    inquiryForm.reset();
    inquiryForm.classList.remove("was-validated");
  });
}

renderDetail(business);
