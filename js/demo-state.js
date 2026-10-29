"use strict";

(() => {
  const PROFILE_KEY = "elmirix-demo-profiles";
  const SESSION_KEY = "elmirix-demo-session";
  const VIEWED_KEY = "elmirix-recently-viewed";
  const businesses = Array.isArray(window.ELMIRIX_BUSINESSES) ? window.ELMIRIX_BUSINESSES : [];
  const baseBusiness = businesses.find((business) => business.id === "greenharvest") || businesses[0];
  const defaultProfiles = {
    owner: {
      name: "Demo Business Owner",
      email: "owner@elmirix.example",
      business: baseBusiness ? {
        id: baseBusiness.id,
        name: baseBusiness.name,
        industry: baseBusiness.industry,
        location: baseBusiness.location,
        foundingYear: baseBusiness.foundingYear,
        stage: baseBusiness.stage,
        shortDescription: baseBusiness.description,
        description: baseBusiness.description,
        mission: baseBusiness.mission,
        vision: baseBusiness.vision,
        products: baseBusiness.products,
        targetMarket: baseBusiness.targetMarket,
        businessModel: baseBusiness.businessModel,
        advantage: baseBusiness.advantage,
        growthStrategy: baseBusiness.growthStrategy,
        website: "",
        imageDataUrl: ""
      } : null
    },
    investor: {
      name: "Demo Investor",
      email: "investor@elmirix.example",
      organization: "",
      industries: ["Technology", "Agriculture"],
      stages: ["Early Stage", "Growing"],
      minInvestment: "",
      maxInvestment: "",
      locations: [],
      introduction: "Exploring sample businesses and emerging opportunities."
    }
  };

  function readJson(storage, key, fallback) {
    try {
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn(`Elmirix could not read demo data for "${key}".`, error);
      return fallback;
    }
  }

  function getProfiles() {
    const value = readJson(window.localStorage, PROFILE_KEY, {});
    const stored = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const storedOwner = stored.owner && typeof stored.owner === "object" && !Array.isArray(stored.owner) ? stored.owner : {};
    const storedInvestor = stored.investor && typeof stored.investor === "object" && !Array.isArray(stored.investor) ? stored.investor : {};
    const storedBusiness = storedOwner.business && typeof storedOwner.business === "object" && !Array.isArray(storedOwner.business) ? storedOwner.business : {};
    return {
      owner: { ...defaultProfiles.owner, ...storedOwner, business: { ...defaultProfiles.owner.business, ...storedBusiness } },
      investor: { ...defaultProfiles.investor, ...storedInvestor }
    };
  }

  function saveProfiles(profiles) {
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
      window.dispatchEvent(new CustomEvent("elmirix:profiles-changed"));
      return true;
    } catch (error) {
      console.error("Elmirix could not save demo profile changes.", error);
      return false;
    }
  }

  function getSession() {
    return readJson(window.sessionStorage, SESSION_KEY, null);
  }

  function setSession(role, name, email) {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role, name, email }));
      return true;
    } catch (error) {
      console.error("Elmirix could not start a demo session.", error);
      return false;
    }
  }

  function clearSession() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("Elmirix could not end the demo session.", error);
    }
  }

  function updateProfile(role, updates) {
    if (role !== "owner" && role !== "investor") {
      throw new TypeError("Only owner and investor demo profiles can be edited.");
    }
    const profiles = getProfiles();
    profiles[role] = { ...profiles[role], ...updates };
    if (!saveProfiles(profiles)) return false;
    const activeSession = getSession();
    if (activeSession?.role === role && (updates.name || updates.email)) {
      return setSession(role, updates.name || activeSession.name, updates.email || activeSession.email);
    }
    return true;
  }

  function getBusiness(id) {
    const business = businesses.find((item) => item.id === id);
    if (!business) return null;
    const ownerBusiness = getProfiles().owner.business;
    if (ownerBusiness?.id !== id) return business;
    const merged = { ...business, ...ownerBusiness, description: ownerBusiness.description || ownerBusiness.shortDescription };
    if (typeof merged.imageDataUrl !== "string" || !/^data:image\/(?:png|jpeg|gif|webp|svg\+xml);base64,/i.test(merged.imageDataUrl)) {
      merged.imageDataUrl = "";
    }
    return merged;
  }

  function getSavedIds() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem("elmirix-saved-businesses") || "[]");
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch (error) {
      console.warn("Elmirix could not read saved demo businesses.", error);
      return [];
    }
  }

  function getViewedIds() {
    const ids = readJson(window.localStorage, VIEWED_KEY, []);
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  }

  function recordViewed(id) {
    if (!businesses.some((business) => business.id === id)) return;
    const viewed = [id, ...getViewedIds().filter((savedId) => savedId !== id)].slice(0, 8);
    try {
      window.localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
    } catch (error) {
      console.warn("Elmirix could not save recently viewed demo businesses.", error);
    }
  }

  window.ElmirixDemo = {
    getProfiles,
    saveProfiles,
    getSession,
    setSession,
    clearSession,
    updateProfile,
    getBusiness,
    getSavedIds,
    getViewedIds,
    recordViewed
  };
})();
