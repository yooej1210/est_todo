const todoService = require("../services/todo.service");

function toDateOrNull(v) {
  if (v === undefined) return undefined; // "수정"에서 미전달
  if (v === null) return null;
  return new Date(v);
}

async function create(req, res) {
  const userId = req.user.id;
  const { text, startDate, endDate, isAllDay, categoryId } = req.validated.body;

  const todo = await todoService.create({
    userId,
    text,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    isAllDay: isAllDay ?? false,
    categoryId: categoryId ?? null,
  });

  res.status(201).json({ todo });
}

async function list(req, res) {
  const userId = req.user.id;
  const { date, filter, from, to } = req.validated.query || {};

  const todos = await todoService.list({
    userId,
    date,
    filter,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  res.json({ todos });
}

async function update(req, res) {
  const userId = req.user.id;
  const { id } = req.validated.params;

  const { text, startDate, endDate, isAllDay, categoryId, isCompleted } =
    req.validated.body;

  const todo = await todoService.update({
    userId,
    id,
    text,
    startDate: toDateOrNull(startDate),
    endDate: toDateOrNull(endDate),
    isAllDay,
    categoryId: categoryId === undefined ? undefined : categoryId,
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
