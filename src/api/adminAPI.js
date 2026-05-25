import axios from "axios";
import { API_ROUTES } from "../utils/apiRoutes";

export const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "http://10.169.204.118:5000";

const API_URL = `${BACKEND_URL}/api`;

const adminAPI = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

adminAPI.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("adminToken");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    if (req.data instanceof FormData)
      req.headers["Content-Type"] = "multipart/form-data";
    return req;
  },
  (error) => Promise.reject(error),
);

adminAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (window.location.pathname.includes("/login")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return adminAPI(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("adminRefreshToken");

      try {
        const { data } = await axios.post(
          `${API_URL}${API_ROUTES.AUTH.REFRESH}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        if (data.success || data.token) {
          const newToken = data.token || data.data.token;
          const newRefreshToken = data.refresh_token || data.data.refresh_token;

          localStorage.setItem("adminToken", newToken);
          localStorage.setItem("adminRefreshToken", newRefreshToken);

          adminAPI.defaults.headers.common["Authorization"] =
            `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return adminAPI(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        console.error("Refresh token expired. Logging out.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminData");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default adminAPI;
