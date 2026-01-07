import { api } from "./axios";

export async function listCategories() {
  const { data } = await api.get("/api/categories");
  return data.categories;
}

export async function createCategory(payload) {
  const { data } = await api.post("/api/categories", payload);
  return data.category;
}

export async function updateCategory(id, payload) {
  const { data } = await api.patch(`/api/categories/${id}`, payload);
  return data.category;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/api/categories/${id}`);
  return data;
}
