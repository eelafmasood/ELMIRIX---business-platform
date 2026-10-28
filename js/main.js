"use strict";

const dialog = document.querySelector("#preview-dialog");
const toastRegion = document.querySelector("#toast-region");
const demoForm = document.querySelector("#demo-form");
const navCollapse = document.querySelector("#main-navigation");

document.querySelector("#current-year").textContent = String(new Date().getFullYear());

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!dialog.open) {
      dialog.showModal();
    }
  });
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

document.querySelectorAll("[data-save-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const isSaved = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(isSaved));
    button.setAttribute("aria-label", isSaved ? "Remove saved example card" : "Save example card");
    button.querySelector("i").className = isSaved ? "bi bi-bookmark-fill" : "bi bi-bookmark";
    showToast(isSaved ? "Example card saved for this preview only." : "Example card removed from this preview.");
  });
});

demoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  demoForm.classList.add("was-validated");

  if (!demoForm.checkValidity()) {
    demoForm.querySelector(":invalid")?.focus();
    return;
  }

  showToast("Form validated. No information was sent or saved.");
  demoForm.reset();
  demoForm.classList.remove("was-validated");
});

demoForm.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    if (field.checkValidity()) {
      field.classList.remove("is-invalid");
    }
  });

  field.addEventListener("invalid", () => field.classList.add("is-invalid"));
});

navCollapse.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 991.98px)").matches && window.bootstrap) {
      window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
    }
  });
});

function showToast(message) {
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
