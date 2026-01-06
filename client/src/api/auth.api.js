import { api } from "./axios";

export async function signupApi(payload) {
  const { data } = await api.post("/api/auth/signup", payload);
  return data;
}

export async function loginApi(payload) {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
}

export async function logoutApi() {
  const { data } = await api.post("/api/auth/logout");
  return data;
}
