import axios from "axios";
import { authStore } from "./authStore";

const api = axios.create({
  baseURL: process.env.REACT_APP_URL,
  withCredentials: true,
});

// let csrfToken = null;
let isRefreshing = false;
let refreshSubscribers = [];
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}
/*
========================
FETCH CSRF TOKEN SAFELY
========================
*/
// export const fetchCsrfToken = async () => {
//   try {
//     const res = await api.get("/api/csrf-token");
//     csrfToken = res.data.csrfToken;
//   } catch (err) {
//     // never break UI
//     console.warn("CSRF token fetch failed");
//   }
// };

/*
========================
REQUEST INTERCEPTOR
Attach CSRF token
========================
*/
api.interceptors.request.use(
  (config) => {
    // if (csrfToken) {
    //   config.headers["X-CSRF-Token"] = csrfToken;
    // }
    const token = authStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
========================
RESPONSE INTERCEPTOR
Handle expired tokens
========================
*/
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ❌ DO NOT retry these endpoints
    if (
      originalRequest?.url?.includes("/api/auth/refresh")
      //  ||originalRequest.url.includes("/api/auth/me")
    ) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const res = await api.post("/api/auth/refresh", {
            token: localStorage.getItem("refreshToken"),
          });
          console.log("RESS", res);
          authStore.setAccessToken(res.data.accessToken);
          isRefreshing = false;
          onRefreshed();

          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          localStorage.removeItem("refreshToken");
          authStore.setAccessToken(null);

          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);
export default api;
