"use strict";

(() => {
  const PROFILE_KEY = "elmirix-demo-profiles";
  const SESSION_KEY = "elmirix-demo-session";
  const ACCOUNTS_KEY = "elmirix-demo-accounts";
  const VIEWED_KEY = "elmirix-recently-viewed";
  const FINANCIAL_RECORDS_KEY = "elmirix-financial-records";
  const FUNDING_REQUESTS_KEY = "elmirix-funding-requests";
  const INQUIRIES_KEY = "elmirix-demo-inquiries";
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

  function getSession() {
    return readJson(window.sessionStorage, SESSION_KEY, null);
  }

  function cloneProfile(role, name, email, businessId) {
    const profile = JSON.parse(JSON.stringify(defaultProfiles[role]));
    profile.name = name;
    profile.email = email;
    if (role === "owner" && profile.business) {
      profile.business.id = businessId || profile.business.id;
      profile.business.sourceId = baseBusiness?.id || profile.business.id;
    }
    return profile;
  }

  function makeBuiltinAccounts() {
    const legacy = readJson(window.localStorage, PROFILE_KEY, {});
    const owner = legacy?.owner && typeof legacy.owner === "object" ? legacy.owner : {};
    const investor = legacy?.investor && typeof legacy.investor === "object" ? legacy.investor : {};
    const ownerBusiness = owner.business && typeof owner.business === "object" ? owner.business : {};
    return [
      { id: "demo-owner", role: "owner", name: owner.name || defaultProfiles.owner.name, email: (owner.email || defaultProfiles.owner.email).toLowerCase(), profile: { ...defaultProfiles.owner, ...owner, business: { ...defaultProfiles.owner.business, ...ownerBusiness, id: "greenharvest", sourceId: "greenharvest" } } },
      { id: "demo-investor", role: "investor", name: investor.name || defaultProfiles.investor.name, email: (investor.email || defaultProfiles.investor.email).toLowerCase(), profile: { ...defaultProfiles.investor, ...investor } }
    ];
  }

  function getAccounts() {
    const stored = readJson(window.localStorage, ACCOUNTS_KEY, null);
    const builtins = makeBuiltinAccounts();
    if (!Array.isArray(stored)) return builtins;
    const validStored = stored.filter((account) =>
      account
      && typeof account.id === "string"
      && (account.role === "owner" || account.role === "investor")
      && typeof account.name === "string"
      && typeof account.email === "string"
      && account.profile
      && typeof account.profile === "object"
      && (account.id !== "demo-owner" || account.role === "owner")
      && (account.id !== "demo-investor" || account.role === "investor")
    );
    const storedById = new Map(validStored.map((account) => [account.id, account]));
    return builtins.map((account) => storedById.get(account.id) || account)
      .concat(validStored.filter((account) => !["demo-owner", "demo-investor"].includes(account.id)));
  }

  function saveAccounts(accounts) {
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent("elmirix:profiles-changed"));
      return true;
    } catch (error) {
      console.error("Elmirix could not save local demo accounts.", error);
      return false;
    }
  }

  function getAccountById(id) {
    return getAccounts().find((account) => account.id === id) || null;
  }

  function getCurrentAccount() {
    const session = getSession();
    return getAccountById(session?.accountId) || getAccountById("demo-investor");
  }

  function getAccountForRole(role) {
    const session = getSession();
    const active = session?.role === role ? getAccountById(session.accountId) : null;
    return active || getAccountById(role === "owner" ? "demo-owner" : "demo-investor");
  }

  function getProfile(role) {
    if (role !== "owner" && role !== "investor") {
      throw new TypeError("Only owner and investor demo profiles are available.");
    }
    return getAccountForRole(role).profile;
  }

  function getProfiles() {
    return {
      owner: getProfile("owner"),
      investor: getProfile("investor")
    };
  }

  function findAccountByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    return getAccounts().find((account) => account.email.toLowerCase() === normalizedEmail) || null;
  }

  function registerAccount(role, name, email) {
    if (role !== "owner" && role !== "investor") {
      return { success: false, error: "Choose a valid demo account type." };
    }
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (normalizedName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: "Enter a valid name and email address." };
    }
    if (findAccountByEmail(normalizedEmail)) {
      return { success: false, error: "A demo profile with this email already exists in this browser. Sign in or use a different email." };
    }
    const accounts = getAccounts();
    const id = `account-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const businessId = role === "owner" ? `business-${id}` : undefined;
    const account = {
      id,
      role,
      name: normalizedName,
      email: normalizedEmail,
      profile: cloneProfile(role, normalizedName, normalizedEmail, businessId)
    };
    accounts.push(account);
    if (!saveAccounts(accounts)) {
      return { success: false, error: "The demo profile could not be saved. Check this browser's local storage settings." };
    }
    return { success: true, account };
  }

  function setSession(role, name, email, accountId) {
    const account = getAccountById(accountId);
    if (!account || account.role !== role || account.email !== String(email).trim().toLowerCase()) {
      console.error("Elmirix could not start a session for an unregistered demo account.");
      return false;
    }
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        accountId: account.id,
        role: account.role,
        name: account.name,
        email: account.email
      }));
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
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) return false;
    const account = getAccountForRole(role);
    const nextName = typeof updates.name === "string" ? updates.name.trim() : account.name;
    const nextEmail = typeof updates.email === "string" ? updates.email.trim().toLowerCase() : account.email;
    if (nextName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) return false;
    const emailOwner = findAccountByEmail(nextEmail);
    if (emailOwner && emailOwner.id !== account.id) return false;
    const accounts = getAccounts();
    const index = accounts.findIndex((item) => item.id === account.id);
    if (index < 0) return false;
    accounts[index] = {
      ...accounts[index],
      name: nextName,
      email: nextEmail,
      profile: { ...accounts[index].profile, ...updates, name: nextName, email: nextEmail }
    };
    if (!saveAccounts(accounts)) return false;
    const activeSession = getSession();
    if (activeSession?.accountId === account.id && (updates.name || updates.email)) {
      return setSession(role, nextName, nextEmail, account.id);
    }
    return true;
  }

  function getBusiness(id) {
    const ownerAccount = getAccounts().find((account) => account.role === "owner" && account.profile.business?.id === id);
    const ownerBusiness = ownerAccount?.profile.business;
    const business = businesses.find((item) => item.id === id)
      || (ownerBusiness && businesses.find((item) => item.id === (ownerBusiness.sourceId || ownerBusiness.id)))
      || null;
    if (!business) return null;
    if (!ownerBusiness) return business;
    const merged = { ...business, ...ownerBusiness, description: ownerBusiness.description || ownerBusiness.shortDescription };
    if (typeof merged.imageDataUrl !== "string" || !/^data:image\/(?:png|jpeg|gif|webp|svg\+xml);base64,/i.test(merged.imageDataUrl)) {
      merged.imageDataUrl = "";
    }
    return merged;
  }

  function getSavedIds() {
    const account = getCurrentAccount();
    const key = account.id === "demo-investor" ? "elmirix-saved-businesses" : `elmirix-saved-businesses:${account.id}`;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch (error) {
      console.warn("Elmirix could not read saved demo businesses.", error);
      return [];
    }
  }

  function getViewedIds() {
    const account = getCurrentAccount();
    const key = account.id === "demo-investor" ? VIEWED_KEY : `${VIEWED_KEY}:${account.id}`;
    const ids = readJson(window.localStorage, key, []);
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  }

  function recordViewed(id) {
    const account = getAccountForRole("investor");
    const business = getBusiness(id);
    if (!business || (!businesses.some((item) => item.id === id) && account.role !== "investor")) return;
    const viewed = [id, ...getViewedIds().filter((savedId) => savedId !== id)].slice(0, 8);
    const key = account.id === "demo-investor" ? VIEWED_KEY : `${VIEWED_KEY}:${account.id}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(viewed));
    } catch (error) {
      console.warn("Elmirix could not save recently viewed demo businesses.", error);
    }
  }

  function getStoredList(key, role = "owner") {
    const storageKey = role ? scopedStorageKey(key, role) : key;
    const value = readJson(window.localStorage, storageKey, []);
    return Array.isArray(value) ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : [];
  }

  function scopedStorageKey(key, role) {
    const account = getAccountForRole(role);
    if (account.id === (role === "owner" ? "demo-owner" : "demo-investor")) return key;
    return `${key}:${account.id}`;
  }

  function saveStoredList(key, value, eventName, role = "owner") {
    if (!Array.isArray(value)) {
      throw new TypeError("Demo records must be saved as a list.");
    }
    try {
      window.localStorage.setItem(role ? scopedStorageKey(key, role) : key, JSON.stringify(value));
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

  function getInquiries() {
    const statuses = ["New", "In review", "Closed"];
    return getStoredList(INQUIRIES_KEY, null).filter((inquiry) =>
      typeof inquiry.id === "string"
      && Boolean(getBusiness(inquiry.businessId))
      && typeof inquiry.businessName === "string"
      && typeof inquiry.investorName === "string"
      && typeof inquiry.investorEmail === "string"
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.investorEmail)
      && typeof inquiry.message === "string"
      && typeof inquiry.createdAt === "string"
      && !Number.isNaN(Date.parse(inquiry.createdAt))
      && statuses.includes(inquiry.status)
    );
  }

  function saveInquiries(inquiries) {
    if (!Array.isArray(inquiries) || inquiries.some((inquiry) =>
      !inquiry
      || typeof inquiry.id !== "string"
      || !getBusiness(inquiry.businessId)
      || typeof inquiry.businessName !== "string"
      || typeof inquiry.investorName !== "string"
      || typeof inquiry.investorEmail !== "string"
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.investorEmail)
      || typeof inquiry.message !== "string"
      || typeof inquiry.createdAt !== "string"
      || Number.isNaN(Date.parse(inquiry.createdAt))
      || !["New", "In review", "Closed"].includes(inquiry.status)
    )) {
      throw new TypeError("Inquiry data is invalid.");
    }
    return saveStoredList(INQUIRIES_KEY, inquiries, "elmirix:inquiries-changed", null);
  }

  function updateInquiryStatus(id, status) {
    if (!["New", "In review", "Closed"].includes(status)) {
      throw new TypeError("Inquiry status is invalid.");
    }
    const inquiries = getInquiries();
    const index = inquiries.findIndex((inquiry) => inquiry.id === id);
    if (index < 0) return false;
    inquiries[index] = { ...inquiries[index], status };
    return saveInquiries(inquiries);
  }

  window.ElmirixDemo = {
    registerAccount,
    findAccountByEmail,
    getProfile,
    getProfiles,
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
    saveFundingRequests,
    getInquiries,
    saveInquiries,
    updateInquiryStatus
  };
})();
