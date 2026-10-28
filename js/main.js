"use strict";

const SAVED_BUSINESSES_KEY = "elmirix-saved-businesses";
let savedBusinessIds = [];

try {
  const storedBookmarks = window.localStorage.getItem(SAVED_BUSINESSES_KEY);
  const parsedBookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
  if (Array.isArray(parsedBookmarks) && parsedBookmarks.every((id) => typeof id === "string")) {
    savedBusinessIds = parsedBookmarks;
  }
} catch (error) {
  console.warn("Elmirix could not read local saved-business preferences.", error);
}

function isSaved(id) {
  return savedBusinessIds.includes(id);
}

function showToast(message) {
  const toastRegion = document.querySelector("#toast-region");
  if (!toastRegion) return;

  const toast = document.createElement("div");
  const icon = document.createElement("i");
  const text = document.createElement("span");
  toast.className = "demo-toast";
  icon.className = "bi bi-check-circle";
  icon.setAttribute("aria-hidden", "true");
  text.textContent = message;
  toast.append(icon, text);
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function saveBookmarks() {
  try {
    window.localStorage.setItem(SAVED_BUSINESSES_KEY, JSON.stringify(savedBusinessIds));
  } catch (error) {
    console.warn("Elmirix could not persist saved-business preferences.", error);
  }
}

function toggleBookmark(button) {
  const id = button.dataset.bookmark;
  if (!id) return;
  const wasSaved = isSaved(id);
  const isNowSaved = !wasSaved;
  savedBusinessIds = wasSaved
    ? savedBusinessIds.filter((savedId) => savedId !== id)
    : [...savedBusinessIds, id];
  saveBookmarks();
  document.querySelectorAll("[data-bookmark]").forEach((bookmarkButton) => {
    if (bookmarkButton.dataset.bookmark !== id) return;
    bookmarkButton.setAttribute("aria-pressed", String(isNowSaved));
    const icon = bookmarkButton.querySelector("i");
    if (icon) icon.className = `bi ${isNowSaved ? "bi-bookmark-fill" : "bi-bookmark"}`;
    if (bookmarkButton.classList.contains("bookmark-button")) {
      const name = bookmarkButton.dataset.bookmarkName || "business";
      bookmarkButton.setAttribute("aria-label", isNowSaved ? `Remove ${name} from saved businesses` : `Save ${name}`);
    }
    const label = bookmarkButton.querySelector("span");
    if (label) label.textContent = isNowSaved ? "Saved" : "Save business";
  });
  window.dispatchEvent(new CustomEvent("elmirix:bookmarks-changed", { detail: { id, saved: !wasSaved } }));
  showToast(isNowSaved ? "Business saved in this browser preview." : "Business removed from your saved sample profiles.");
}

window.Elmirix = {
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0
    }).format(amount);
  },
  isSaved,
  showToast
};

document.querySelectorAll("[data-current-year]").forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

document.addEventListener("click", (event) => {
  const bookmark = event.target.closest("[data-bookmark]");
  if (bookmark) toggleBookmark(bookmark);
});

const navCollapse = document.querySelector("#main-navigation");
if (navCollapse) {
  navCollapse.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 991.98px)").matches && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("invalid", () => field.classList.add("is-invalid"));
    field.addEventListener("input", () => {
      if (field.checkValidity()) field.classList.remove("is-invalid");
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactForm.classList.add("was-validated");
    if (!contactForm.checkValidity()) {
      contactForm.querySelector(":invalid")?.focus();
      return;
    }

    showToast("Message preview validated. It was not sent or stored.");
    contactForm.reset();
    contactForm.classList.remove("was-validated");
  });
}
