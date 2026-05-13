import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const getApiClient = (token?: string) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const authToken = token || getCookie("token");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        deleteCookie("token");
        deleteCookie("user");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const authApi = {
  login: (username: string, password: string) =>
    getApiClient().post("/users/login", { username, password }),

  register: (data: any) => getApiClient().post("/users/register", data),

  getCurrentUser: (token?: string) => getApiClient(token).get("/users/me"),
};

export const processApi = {
  getDefinitions: () => getApiClient().get("/process/definitions"),

  getDefinition: (id: string) =>
    getApiClient().get(`/process/definitions/${id}`),

  getFlowChart: (id: string) =>
    getApiClient().get(`/process/definitions/${id}/flow-chart`),

  startProcess: (data: any) => getApiClient().post("/process/start", data),

  getMyPending: () => getApiClient().get("/process/instances/pending"),

  getMyProcesses: () => getApiClient().get("/process/instances/my"),

  getAllProcesses: (params?: any) =>
    getApiClient().get("/process/instances", { params }),

  getProcessDetail: (id: string) =>
    getApiClient().get(`/process/instances/${id}`),

  approveTask: (id: string, data: any) =>
    getApiClient().put(`/process/instances/${id}/approve`, data),
};

export const messageApi = {
  getMessages: (isRead?: boolean) =>
    getApiClient().get("/messages", { params: { isRead } }),

  getUnreadCount: () => getApiClient().get("/messages/unread-count"),

  markAsRead: (id: string) => getApiClient().put(`/messages/${id}/read`),

  markAllAsRead: () => getApiClient().put("/messages/read-all"),
};

export const uploadApi = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return getApiClient().post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
