import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔑 Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = token; 
      // (we are NOT using "Bearer" because backend expects raw token)
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
