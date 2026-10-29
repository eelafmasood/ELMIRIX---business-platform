"use strict";

const authForm = document.querySelector("[data-auth-form]");
const passwordFields = document.querySelectorAll("[data-password]");

passwordFields.forEach((field) => {
  field.addEventListener("input", () => {
    if (field.checkValidity()) field.classList.remove("is-invalid");
  });
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const field = document.getElementById(button.dataset.passwordToggle);
    if (!field) return;
    const show = field.type === "password";
    field.type = show ? "text" : "password";
    button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    button.setAttribute("aria-pressed", String(show));
    button.querySelector("i").className = `bi ${show ? "bi-eye-slash" : "bi-eye"}`;
  });
});

if (authForm?.dataset.authForm === "register") {
  const password = document.querySelector("#register-password");
  const confirmation = document.querySelector("#register-confirm-password");
  const validateConfirmation = () => {
    confirmation.setCustomValidity(password.value === confirmation.value ? "" : "Passwords do not match.");
  };
  password.addEventListener("input", validateConfirmation);
  confirmation.addEventListener("input", validateConfirmation);
}

if (authForm) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (authForm.dataset.authForm === "register") {
      const password = document.querySelector("#register-password");
      const confirmation = document.querySelector("#register-confirm-password");
      confirmation.setCustomValidity(password.value === confirmation.value ? "" : "Passwords do not match.");
    }

    authForm.classList.add("was-validated");
    if (!authForm.checkValidity()) {
      authForm.querySelector(":invalid")?.focus();
      return;
    }

    const role = document.querySelector("#account-type").value;
    const nameField = document.querySelector("#full-name");
    const email = document.querySelector("#auth-email").value.trim();
    const profiles = window.ElmirixDemo.getProfiles();
    const name = nameField?.value.trim() || profiles[role].name;
    if (authForm.dataset.authForm === "register"
      && !window.ElmirixDemo.updateProfile(role, { name, email })) {
      window.Elmirix.showToast("The demo profile could not be saved. Check browser storage settings.");
      return;
    }
    if (!window.ElmirixDemo.setSession(role, name, email)) {
      window.Elmirix.showToast("The demo session could not be started. Check browser session storage settings.");
      return;
    }

    authForm.querySelectorAll('input[type="password"]').forEach((field) => {
      field.value = "";
    });
    window.location.assign(role === "owner" ? "owner-dashboard.html" : "investor-dashboard.html");
  });

  authForm.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", () => {
      if (field.checkValidity()) field.classList.remove("is-invalid");
    });
    field.addEventListener("change", () => {
      if (field.checkValidity()) field.classList.remove("is-invalid");
    });
    field.addEventListener("invalid", () => field.classList.add("is-invalid"));
  });
}

document.querySelectorAll("[data-forgot-password]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.Elmirix.showToast("Password recovery is not available in this frontend demonstration.");
  });
});
