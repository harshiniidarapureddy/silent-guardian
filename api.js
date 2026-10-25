import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
export const API = `${BASE}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("sg_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const saveAuth = (token, user) => {
  localStorage.setItem("sg_token", token);
  localStorage.setItem("sg_user", JSON.stringify(user));
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("sg_user") || "null"); }
  catch { return null; }
};

export const logout = () => {
  localStorage.removeItem("sg_token");
  localStorage.removeItem("sg_user");
};
