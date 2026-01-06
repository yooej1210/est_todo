import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  withCredentials: true, // refresh를 쿠키로 할 경우 대비
});
