const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (err) {
    throw new ApiError(
      "Couldn't reach the RepairConnect server. Please check your connection and that the backend is running.",
      0,
      null
    );
  }

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail?.message || "Something went wrong. Please try again.";
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const api = {
  health: () => request("/health"),

  analyzeItem: (formData) =>
    request("/api/analyze", {
      method: "POST",
      body: formData,
    }),

  getReport: (reportId) => request(`/api/reports/${reportId}`),

  recomputeRepairScore: (payload) =>
    request("/api/repair-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  listTechnicians: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
    ).toString();
    return request(`/api/technicians${query ? `?${query}` : ""}`);
  },

  getTechnician: (id) => request(`/api/technicians/${id}`),

  createRepairRequest: (payload) =>
    request("/api/repair-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  getRepairRequest: (id) => request(`/api/repair-requests/${id}`),

  updateRepairRequestStatus: (id, status) =>
    request(`/api/repair-requests/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),

  getDashboard: () => request("/api/dashboard"),
};

export { ApiError, API_BASE_URL };
