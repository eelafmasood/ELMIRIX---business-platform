"use strict";

(() => {
  const PROFILE_KEY = "elmirix-demo-profiles";
  const SESSION_KEY = "elmirix-demo-session";
  const VIEWED_KEY = "elmirix-recently-viewed";
  const FINANCIAL_RECORDS_KEY = "elmirix-financial-records";
  const FUNDING_REQUESTS_KEY = "elmirix-funding-requests";
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

  function getStoredList(key) {
    const value = readJson(window.localStorage, key, []);
    return Array.isArray(value) ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : [];
  }

  function saveStoredList(key, value, eventName) {
    if (!Array.isArray(value)) {
      throw new TypeError("Demo records must be saved as a list.");
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(eventName));
      return true;
    } catch (error) {
      console.error(`Elmirix could not save demo data for "${key}".`, error);
      return false;
    }
  }

  function getFinancialRecords() {
    return getStoredList(FINANCIAL_RECORDS_KEY).filter((record) =>
      typeof record.id === "string"
      && (record.type === "income" || record.type === "expense")
      && typeof record.description === "string"
      && typeof record.category === "string"
      && typeof record.date === "string"
      && Number.isFinite(record.amount)
      && record.amount > 0
      && typeof record.notes === "string"
    );
  }

  function saveFinancialRecords(records) {
    return saveStoredList(FINANCIAL_RECORDS_KEY, records, "elmirix:financial-records-changed");
  }

  function getFundingRequests() {
    const statuses = ["Draft", "Seeking interest", "Paused", "Closed"];
    return getStoredList(FUNDING_REQUESTS_KEY).filter((request) =>
      typeof request.id === "string"
      && typeof request.title === "string"
      && Number.isFinite(request.amount)
      && request.amount > 0
      && typeof request.purpose === "string"
      && typeof request.useOfFunds === "string"
      && statuses.includes(request.status)
      && typeof request.createdAt === "string"
    );
  }

  function saveFundingRequests(requests) {
    return saveStoredList(FUNDING_REQUESTS_KEY, requests, "elmirix:funding-requests-changed");
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
    recordViewed,
    getFinancialRecords,
    saveFinancialRecords,
    getFundingRequests,
    saveFundingRequests
  };
})();
