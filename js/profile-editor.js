"use strict";

const editor = document.querySelector("[data-profile-editor]");
const role = editor?.dataset.profileEditor;
const profiles = window.ElmirixDemo.getProfiles();
const current = profiles[role];
const message = document.querySelector("#profile-message");

function setFormValue(name, value) {
  const field = editor.elements.namedItem(name);
  if (field && "value" in field) field.value = value ?? "";
}

function selectedValues(name) {
  return [...editor.querySelectorAll(`[name="${name}"]:checked`)].map((field) => field.value);
}

function updateSelected(name, selected) {
  const selectedSet = new Set(selected || []);
  editor.querySelectorAll(`[name="${name}"]`).forEach((field) => {
    field.checked = selectedSet.has(field.value);
  });
}

function showProfileMessage(text, kind = "success") {
  message.textContent = text;
  message.className = `profile-message profile-message-${kind}`;
  message.hidden = false;
}

function loadOwnerProfile() {
  const business = window.ElmirixDemo.getBusiness(current.business?.id || "greenharvest");
  if (!business) throw new Error("The owner demo business could not be loaded.");
  [
    "name", "industry", "location", "foundingYear", "stage",
    "shortDescription", "description", "mission", "vision", "products",
    "targetMarket", "businessModel", "advantage", "growthStrategy", "website"
  ].forEach((field) => setFormValue(field, business[field]));
  const preview = document.querySelector("#owner-image-preview");
  const placeholder = document.querySelector("#owner-image-placeholder");
  if (business.imageDataUrl) {
    preview.src = business.imageDataUrl;
    preview.hidden = false;
    placeholder.hidden = true;
  } else {
    preview.hidden = true;
    placeholder.hidden = false;
  }
}

function loadInvestorProfile() {
  ["name", "email", "organization", "minInvestment", "maxInvestment", "introduction"].forEach((field) => setFormValue(field, current[field]));
  updateSelected("industries", current.industries);
  updateSelected("stages", current.stages);
  updateSelected("locations", current.locations);
}

if (!editor || !["owner", "investor"].includes(role)) {
  throw new Error("Profile editor is missing a valid demo role.");
}

if (role === "owner") loadOwnerProfile();
if (role === "investor") loadInvestorProfile();

editor.addEventListener("input", (event) => {
  if (event.target.matches("input, textarea, select") && event.target.checkValidity()) {
    event.target.classList.remove("is-invalid");
  }
});
editor.addEventListener("invalid", (event) => {
  if (event.target.matches("input, textarea, select")) event.target.classList.add("is-invalid");
}, true);

editor.querySelector("[data-preview-profile]")?.addEventListener("click", () => {
  if (role !== "owner") return;
  const profilesNow = window.ElmirixDemo.getProfiles();
  const id = profilesNow.owner.business?.id || "greenharvest";
  window.open(`business-details.html?id=${encodeURIComponent(id)}`, "_blank", "noopener,noreferrer");
});

editor.querySelector("[data-cancel-profile]")?.addEventListener("click", () => {
  if (role === "owner") loadOwnerProfile();
  if (role === "investor") loadInvestorProfile();
  editor.classList.remove("was-validated");
  showProfileMessage("Unsaved changes were discarded.", "info");
});

const imageInput = document.querySelector("#business-image");
imageInput?.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    imageInput.setCustomValidity("Choose an image file.");
    imageInput.reportValidity();
    imageInput.setCustomValidity("");
    imageInput.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    imageInput.setCustomValidity("Choose an image smaller than 2 MB.");
    imageInput.reportValidity();
    imageInput.setCustomValidity("");
    imageInput.value = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const preview = document.querySelector("#owner-image-preview");
    preview.src = String(reader.result);
    preview.hidden = false;
    document.querySelector("#owner-image-placeholder").hidden = true;
  });
  reader.addEventListener("error", () => showProfileMessage("The selected image could not be previewed.", "error"));
  reader.readAsDataURL(file);
});

editor.addEventListener("submit", (event) => {
  event.preventDefault();
  editor.classList.add("was-validated");
  if (!editor.checkValidity()) {
    editor.querySelector(":invalid")?.focus();
    return;
  }

  let success;
  if (role === "owner") {
    const old = window.ElmirixDemo.getProfiles().owner;
    const imagePreview = document.querySelector("#owner-image-preview");
    const business = {
      ...old.business,
      id: old.business?.id || "greenharvest",
      name: editor.elements.name.value.trim(),
      industry: editor.elements.industry.value,
      location: editor.elements.location.value.trim(),
      foundingYear: Number(editor.elements.foundingYear.value),
      stage: editor.elements.stage.value,
      shortDescription: editor.elements.shortDescription.value.trim(),
      description: editor.elements.description.value.trim(),
      mission: editor.elements.mission.value.trim(),
      vision: editor.elements.vision.value.trim(),
      products: editor.elements.products.value.trim(),
      targetMarket: editor.elements.targetMarket.value.trim(),
      businessModel: editor.elements.businessModel.value.trim(),
      advantage: editor.elements.advantage.value.trim(),
      growthStrategy: editor.elements.growthStrategy.value.trim(),
      website: editor.elements.website.value.trim(),
      imageDataUrl: imagePreview.hidden ? "" : imagePreview.src.startsWith("data:image/") ? imagePreview.src : old.business?.imageDataUrl || ""
    };
    success = window.ElmirixDemo.updateProfile("owner", { business });
  } else {
    const updates = {
      name: editor.elements.name.value.trim(),
      email: editor.elements.email.value.trim(),
      organization: editor.elements.organization.value.trim(),
      industries: selectedValues("industries"),
      stages: selectedValues("stages"),
      minInvestment: editor.elements.minInvestment.value,
      maxInvestment: editor.elements.maxInvestment.value,
      locations: selectedValues("locations"),
      introduction: editor.elements.introduction.value.trim()
    };
    const existingAccount = window.ElmirixDemo.findAccountByEmail(updates.email);
    const currentAccount = window.ElmirixDemo.getSession();
    if (existingAccount && existingAccount.id !== currentAccount?.accountId) {
      showProfileMessage("That email is already used by another demo profile in this browser.", "error");
      editor.elements.email.focus();
      return;
    }
    const min = updates.minInvestment === "" ? null : Number(updates.minInvestment);
    const max = updates.maxInvestment === "" ? null : Number(updates.maxInvestment);
    if (min !== null && max !== null && min > max) {
      editor.elements.maxInvestment.setCustomValidity("Maximum investment must be greater than or equal to minimum.");
      editor.elements.maxInvestment.reportValidity();
      editor.elements.maxInvestment.setCustomValidity("");
      return;
    }
    success = window.ElmirixDemo.updateProfile("investor", updates);
  }

  if (success) {
    editor.classList.remove("was-validated");
    showProfileMessage("Your demo profile changes were saved in this browser.");
    window.Elmirix.showToast("Demo profile saved locally. No credentials were stored.");
  } else {
    showProfileMessage("Changes could not be saved. Check for an email already in use and confirm browser storage is available.", "error");
  }
});
