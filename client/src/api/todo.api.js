import { api } from "./axios";

export async function listTodos(params) {
  const { data } = await api.get("/api/todos", { params });
  return data.todos;
}

export async function createTodo(payload) {
  const { data } = await api.post("/api/todos", payload);
  return data.todo;
}

export async function updateTodo(id, payload) {
  const { data } = await api.patch(`/api/todos/${id}`, payload);
  return data.todo;
}

export async function toggleTodo(id) {
  const { data } = await api.patch(`/api/todos/${id}/toggle`);
  return data.todo;
}

export async function deleteTodo(id) {
  const { data } = await api.delete(`/api/todos/${id}`);
  return data;
}
