const todoService = require("../services/todo.service");

async function create(req, res) {
  const userId = req.user.id;
  const { title, content, dueDate, categoryId } = req.validated.body;

  const todo = await todoService.create({
    userId,
    title,
    content,
    dueDate: dueDate ? new Date(dueDate) : null,
    categoryId: categoryId ?? null,
  });

  res.status(201).json({ todo });
}

async function list(req, res) {
  const userId = req.user.id;
  const { date, filter } = (req.validated.query || {});

  const todos = await todoService.list({ userId, date, filter });
  res.json({ todos });
}

async function update(req, res) {
  const userId = req.user.id;
  const { id } = req.validated.params;
  const { title, content, dueDate, categoryId, isCompleted } = req.validated.body;

  const todo = await todoService.update({
    userId,
    id,
    title,
    content,
    dueDate: dueDate === undefined ? undefined : (dueDate === null ? null : new Date(dueDate)),
    categoryId: categoryId === undefined ? undefined : categoryId, // null 가능
    isCompleted,
  });

  res.json({ todo });
}

async function toggle(req, res) {
  const userId = req.user.id;
  const { id } = req.validated.params;

  const todo = await todoService.toggle({ userId, id });
  res.json({ todo });
}

async function remove(req, res) {
  const userId = req.user.id;
  const { id } = req.validated.params;

  await todoService.remove({ userId, id });
  res.json({ message: "Deleted" });
}

module.exports = { create, list, update, toggle, remove };
