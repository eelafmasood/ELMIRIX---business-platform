"use strict";

const authForm = document.querySelector("[data-auth-form]");
const passwordFields = document.querySelectorAll("[data-password]");
const authMessage = document.querySelector("#auth-message");

function showAuthMessage(text, kind = "error") {
  if (!authMessage) return;
  authMessage.textContent = text;
  authMessage.className = `auth-message auth-message-${kind}`;
  authMessage.hidden = false;
}

function clearAuthMessage() {
  if (authMessage) authMessage.hidden = true;
}

function clearPasswords() {
  passwordFields.forEach((field) => {
    field.value = "";
    field.classList.remove("is-invalid");
    field.parentElement.classList.remove("is-invalid");
  });
}

passwordFields.forEach((field) => {
  field.addEventListener("input", () => {
    if (field.checkValidity()) {
      field.classList.remove("is-invalid");
      field.parentElement.classList.remove("is-invalid");
    }
    clearAuthMessage();
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
    field.focus();
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
    clearAuthMessage();

    if (authForm.dataset.authForm === "register") {
      const password = document.querySelector("#register-password");
      const confirmation = document.querySelector("#register-confirm-password");
      confirmation.setCustomValidity(password.value === confirmation.value ? "" : "Passwords do not match.");
    }

    authForm.classList.add("was-validated");
    if (!authForm.checkValidity()) {
      const invalidField = authForm.querySelector(":invalid");
      const fieldLabel = invalidField?.labels?.[0]?.textContent.trim() || "a required field";
      showAuthMessage(`Please check ${fieldLabel}. ${invalidField?.validationMessage || "Complete the required field and try again."}`);
      invalidField?.focus();
      invalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let account;
    if (authForm.dataset.authForm === "register") {
      const result = window.ElmirixDemo.registerAccount(
        document.querySelector("#account-type").value,
        document.querySelector("#full-name").value,
        document.querySelector("#auth-email").value
      );
      if (!result.success) {
        showAuthMessage(result.error);
        document.querySelector("#auth-email").focus();
        return;
      }
      account = result.account;
    } else {
      account = window.ElmirixDemo.findAccountByEmail(document.querySelector("#auth-email").value);
      if (!account) {
        showAuthMessage("No demo profile with this email is registered in this browser. Create a demo profile first.");
        document.querySelector("#auth-email").focus();
        return;
      }
    }

    if (!window.ElmirixDemo.setSession(account.role, account.name, account.email, account.id)) {
      showAuthMessage("The demo session could not be started. Check browser session storage settings.");
      return;
    }

    clearPasswords();
    window.location.assign(account.role === "owner" ? "owner-dashboard.html" : "investor-dashboard.html");
  });

  authForm.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", () => {
      if (field.checkValidity()) field.classList.remove("is-invalid");
      clearAuthMessage();
    });
    field.addEventListener("change", () => {
      if (field.checkValidity()) field.classList.remove("is-invalid");
      clearAuthMessage();
    });
    field.addEventListener("invalid", () => {
      field.classList.add("is-invalid");
      if (field.matches("[data-password]")) field.parentElement.classList.add("is-invalid");
    });
  });
}

document.querySelectorAll("[data-forgot-password]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.Elmirix.showToast("Password recovery is not available in this frontend demonstration. Demo passwords are not stored.");
  });
});
