"use strict";

const grid = document.querySelector("#business-grid");
const searchInput = document.querySelector("#business-search");
const industryFilter = document.querySelector("#filter-industry");
const locationFilter = document.querySelector("#filter-location");
const stageFilter = document.querySelector("#filter-stage");
const profitabilityFilter = document.querySelector("#filter-profitability");
const revenueFilter = document.querySelector("#filter-revenue");
const minFundingFilter = document.querySelector("#filter-min-funding");
const maxFundingFilter = document.querySelector("#filter-max-funding");
const sortSelect = document.querySelector("#sort-businesses");
const resultCount = document.querySelector("#result-count");
const emptyResults = document.querySelector("#empty-results");
const errorState = document.querySelector("#directory-error");
const filterInputs = [searchInput, industryFilter, locationFilter, stageFilter, profitabilityFilter, revenueFilter, minFundingFilter, maxFundingFilter, sortSelect];
const escapeHTML = window.Elmirix.escapeHTML;

function directoryCard(business) {
  const image = business.imageDataUrl || business.image;
  const revenue = business.revenue === null ? "Not reported" : window.Elmirix.formatCurrency(business.revenue);
  const stateClass = business.profitability === "Profitable" ? "status-positive" : business.profitability === "Operating at a loss" ? "status-negative" : "status-neutral";
  const saved = window.Elmirix.isSaved(business.id);
  return `<div class="col-md-6 col-xl-4">
    <article class="business-card">
      <a class="business-image ${escapeHTML(business.color)}" href="business-details.html?id=${encodeURIComponent(business.id)}" aria-label="View ${escapeHTML(business.name)} profile">
        <img src="${escapeHTML(image)}" alt="" loading="lazy">
        <span class="image-industry">${escapeHTML(business.industry)}</span><span class="image-stage">${escapeHTML(business.stage)}</span>
      </a>
      <div class="business-card-body">
        <div class="business-card-title"><div><h3><a href="business-details.html?id=${encodeURIComponent(business.id)}">${escapeHTML(business.name)}</a></h3><p><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escapeHTML(business.location)}</p></div>
          <button class="icon-button bookmark-button" type="button" data-bookmark="${escapeHTML(business.id)}" data-bookmark-name="${escapeHTML(business.name)}" aria-label="${saved ? "Remove " + escapeHTML(business.name) + " from saved businesses" : "Save " + escapeHTML(business.name)}" aria-pressed="${saved}"><i class="bi ${saved ? "bi-bookmark-fill" : "bi-bookmark"}" aria-hidden="true"></i></button>
        </div>
        <p class="business-description">${escapeHTML(business.shortDescription || business.description)}</p>
        <div class="business-financials"><div><span>Funding goal</span><strong>${window.Elmirix.formatCurrency(business.fundingTarget)}</strong></div><div><span>Annual revenue</span><strong>${revenue}</strong></div></div>
        <div class="business-card-footer"><span class="profitability ${stateClass}"><span class="profit-dot"></span>${escapeHTML(business.profitability)}</span><a class="card-link" href="business-details.html?id=${encodeURIComponent(business.id)}">View business <i class="bi bi-arrow-right" aria-hidden="true"></i></a></div>
      </div>
    </article>
  </div>`;
}

function setupOptions(select, values) {
  values.sort((a, b) => a.localeCompare(b)).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function filterBusinesses() {
  if (!Array.isArray(window.ELMIRIX_BUSINESSES)) {
    errorState.hidden = false;
    resultCount.textContent = "Sample directory unavailable";
    return;
  }

  const query = searchInput.value.trim().toLocaleLowerCase();
  const minFunding = minFundingFilter.value === "" ? null : Number(minFundingFilter.value);
  const maxFunding = maxFundingFilter.value === "" ? null : Number(maxFundingFilter.value);
  let businesses = window.ELMIRIX_BUSINESSES.map((business) => window.ElmirixDemo.getBusiness(business.id)).filter((business) => {
    const text = [business.name, business.industry, business.location, business.description, business.products].join(" ").toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!industryFilter.value || business.industry === industryFilter.value)
      && (!locationFilter.value || business.location === locationFilter.value)
      && (!stageFilter.value || business.stage === stageFilter.value)
      && (!profitabilityFilter.value || business.profitability === profitabilityFilter.value)
      && (!revenueFilter.value || (revenueFilter.value === "available" ? business.revenue !== null : business.revenue === null))
      && (minFunding === null || business.fundingTarget >= minFunding)
      && (maxFunding === null || business.fundingTarget <= maxFunding);
  });

  const margin = (business) => {
    if (business.revenue === null || business.revenue === 0) return null;
    return ((business.revenue + (business.otherIncome || 0) - business.operatingExpenses - business.otherExpenses) / business.revenue) * 100;
  };
  const sorters = {
    newest: (a, b) => b.updated.localeCompare(a.updated),
    "funding-asc": (a, b) => a.fundingTarget - b.fundingTarget,
    "funding-desc": (a, b) => b.fundingTarget - a.fundingTarget,
    "revenue-desc": (a, b) => (b.revenue ?? -1) - (a.revenue ?? -1),
    "margin-desc": (a, b) => (margin(b) ?? -Infinity) - (margin(a) ?? -Infinity)
  };
  businesses.sort(sorters[sortSelect.value] || sorters.newest);
  grid.innerHTML = businesses.map(directoryCard).join("");
  resultCount.textContent = `${businesses.length} ${businesses.length === 1 ? "sample business" : "sample businesses"} found`;
  emptyResults.classList.toggle("d-none", businesses.length > 0);
  errorState.hidden = true;
  document.querySelector("#active-filter-label").textContent = industryFilter.value || locationFilter.value || stageFilter.value || profitabilityFilter.value ? "Filters applied" : "";
}

function clearFilters() {
  filterInputs.forEach((input) => {
    if (input === sortSelect) input.value = "newest";
    else input.value = "";
  });
  filterBusinesses();
}

if (Array.isArray(window.ELMIRIX_BUSINESSES)) {
  setupOptions(industryFilter, [...new Set(window.ELMIRIX_BUSINESSES.map((business) => business.industry))]);
  setupOptions(locationFilter, [...new Set(window.ELMIRIX_BUSINESSES.map((business) => business.location))]);
  const selectedIndustry = new URLSearchParams(window.location.search).get("industry");
  if (selectedIndustry && [...industryFilter.options].some((option) => option.value === selectedIndustry)) {
    industryFilter.value = selectedIndustry;
  }
  filterInputs.forEach((input) => input.addEventListener(input === searchInput ? "input" : "change", filterBusinesses));
  document.querySelector("#clear-filters").addEventListener("click", clearFilters);
  document.querySelector("#empty-clear-filters").addEventListener("click", clearFilters);
  window.addEventListener("elmirix:bookmarks-changed", filterBusinesses);
  filterBusinesses();
} else {
  errorState.hidden = false;
  resultCount.textContent = "Sample directory unavailable";
}

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});
