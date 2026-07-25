const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("crm_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("crm_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("crm_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    }).then(async (res) => {
      if (!res.ok) throw new Error("Invalid email or password.");
      return res.json() as Promise<{ access_token: string; token_type: string }>;
    });
  },
  register: (full_name: string, email: string, password: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password }),
    }),
  me: () => request("/users/me"),

  listContacts: () => request("/contacts"),
  createContact: (data: unknown) =>
    request("/contacts", { method: "POST", body: JSON.stringify(data) }),
  getContact: (id: string) => request(`/contacts/${id}`),
  updateContact: (id: string, data: unknown) =>
    request(`/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteContact: (id: string) => request(`/contacts/${id}`, { method: "DELETE" }),

  listDeals: () => request("/deals"),
  createDeal: (data: unknown) =>
    request("/deals", { method: "POST", body: JSON.stringify(data) }),
  updateDeal: (id: string, data: unknown) =>
    request(`/deals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteDeal: (id: string) => request(`/deals/${id}`, { method: "DELETE" }),

  listActivities: (contactId: string) => request(`/activities/contact/${contactId}`),
  createActivity: (data: unknown) =>
    request("/activities", { method: "POST", body: JSON.stringify(data) }),

  listFollowups: (onlyPending = false) =>
    request(`/followups${onlyPending ? "?only_pending=true" : ""}`),
  createFollowup: (data: unknown) =>
    request("/followups", { method: "POST", body: JSON.stringify(data) }),
  updateFollowup: (id: string, data: unknown) =>
    request(`/followups/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteFollowup: (id: string) => request(`/followups/${id}`, { method: "DELETE" }),

  listSiteVisits: (contactId?: string) =>
    request(`/site-visits${contactId ? `?contact_id=${contactId}` : ""}`),
  createSiteVisit: (data: unknown) =>
    request("/site-visits", { method: "POST", body: JSON.stringify(data) }),
  updateSiteVisit: (id: string, data: unknown) =>
    request(`/site-visits/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSiteVisit: (id: string) => request(`/site-visits/${id}`, { method: "DELETE" }),

  listDocuments: (contactId?: string) =>
    request(`/documents${contactId ? `?contact_id=${contactId}` : ""}`),
  createDocument: (data: unknown) =>
    request("/documents", { method: "POST", body: JSON.stringify(data) }),
  deleteDocument: (id: string) => request(`/documents/${id}`, { method: "DELETE" }),

  listPaymentMilestones: (dealId?: string) =>
    request(`/payment-milestones${dealId ? `?deal_id=${dealId}` : ""}`),
  createPaymentMilestone: (data: unknown) =>
    request("/payment-milestones", { method: "POST", body: JSON.stringify(data) }),
  updatePaymentMilestone: (id: string, data: unknown) =>
    request(`/payment-milestones/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePaymentMilestone: (id: string) => request(`/payment-milestones/${id}`, { method: "DELETE" }),

  listAutomations: () => request("/automations"),
  updateAutomation: (key: string, data: unknown) =>
    request(`/automations/${key}`, { method: "PATCH", body: JSON.stringify(data) }),
  runAutomation: (key: string) => request(`/automations/${key}/run`, { method: "POST" }),
  listAutomationLogs: () => request("/automations/logs/recent"),

  listProperties: () => request("/properties"),
  createProperty: (data: unknown) =>
    request("/properties", { method: "POST", body: JSON.stringify(data) }),
  getProperty: (id: string) => request(`/properties/${id}`),
  updateProperty: (id: string, data: unknown) =>
    request(`/properties/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProperty: (id: string) => request(`/properties/${id}`, { method: "DELETE" }),

  listPipelineStages: () => request("/pipeline-stages"),
  createPipelineStage: (data: unknown) =>
    request("/pipeline-stages", { method: "POST", body: JSON.stringify(data) }),
  updatePipelineStage: (id: string, data: unknown) =>
    request(`/pipeline-stages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePipelineStage: (id: string) => request(`/pipeline-stages/${id}`, { method: "DELETE" }),

  createPropertyShareLink: (propertyId: string, contactId?: string | null) =>
    request(`/properties/${propertyId}/share-link`, {
      method: "POST",
      body: JSON.stringify({ contact_id: contactId || null }),
    }),
  listPropertyViews: (propertyId: string) => request(`/properties/${propertyId}/views`),
  getPublicProperty: (token: string) =>
    fetch(`${API_URL}/public/properties/${token}`).then(async (res) => {
      if (!res.ok) throw new Error("This listing link is invalid or expired.");
      return res.json();
    }),
};

export { API_URL };
