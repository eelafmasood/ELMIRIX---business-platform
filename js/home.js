"use strict";

const featuredContainer = document.querySelector("#featured-businesses");
const escapeHTML = window.Elmirix.escapeHTML;
const formatPKR = (amount) => new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0
}).format(amount);

function businessCard(business, compact = false) {
  const image = business.imageDataUrl || business.image;
  const revenue = business.revenue === null ? "Not reported" : formatPKR(business.revenue);
  const resultClass = business.profitability === "Profitable" ? "status-positive" : business.profitability === "Operating at a loss" ? "status-negative" : "status-neutral";
  return `<div class="col-md-6 col-xl-4">
    <article class="business-card">
      <a class="business-image ${escapeHTML(business.color)}" href="business-details.html?id=${encodeURIComponent(business.id)}" aria-label="View ${escapeHTML(business.name)} profile">
        <img src="${escapeHTML(image)}" alt="" loading="lazy">
        <span class="image-industry">${escapeHTML(business.industry)}</span>
        <span class="image-stage">${escapeHTML(business.stage)}</span>
      </a>
      <div class="business-card-body">
        <div class="business-card-title"><div><h3><a href="business-details.html?id=${encodeURIComponent(business.id)}">${escapeHTML(business.name)}</a></h3><p><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escapeHTML(business.location)}</p></div>
          <button class="icon-button bookmark-button" type="button" data-bookmark="${escapeHTML(business.id)}" data-bookmark-name="${escapeHTML(business.name)}" aria-label="Save ${escapeHTML(business.name)}" aria-pressed="${window.Elmirix.isSaved(business.id)}"><i class="bi ${window.Elmirix.isSaved(business.id) ? "bi-bookmark-fill" : "bi-bookmark"}" aria-hidden="true"></i></button>
        </div>
        <p class="business-description">${escapeHTML(business.shortDescription || business.description)}</p>
        <div class="business-financials">
          <div><span>Funding goal</span><strong>${formatPKR(business.fundingTarget)}</strong></div>
          <div><span>Annual revenue</span><strong>${revenue}</strong></div>
        </div>
        <div class="business-card-footer"><span class="profitability ${resultClass}"><span class="profit-dot"></span>${escapeHTML(business.profitability)}</span><a class="card-link" href="business-details.html?id=${encodeURIComponent(business.id)}">View business <i class="bi bi-arrow-right" aria-hidden="true"></i></a></div>
      </div>
    </article>
  </div>`;
}

if (featuredContainer && Array.isArray(window.ELMIRIX_BUSINESSES)) {
  const featured = window.ELMIRIX_BUSINESSES.slice(0, 3).map((business) => window.ElmirixDemo.getBusiness(business.id));
  featuredContainer.innerHTML = featured.map((business) => businessCard(business, true)).join("");
  document.querySelector('[data-stat="businesses"]').textContent = String(window.ELMIRIX_BUSINESSES.length).padStart(2, "0");
  document.querySelector('[data-stat="industries"]').textContent = String(new Set(window.ELMIRIX_BUSINESSES.map((business) => business.industry)).size).padStart(2, "0");
  document.querySelector('[data-stat="opportunities"]').textContent = String(window.ELMIRIX_BUSINESSES.filter((business) => business.fundingStatus !== "Draft").length).padStart(2, "0");
}
