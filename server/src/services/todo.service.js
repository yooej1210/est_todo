const { prisma } = require("../config/prisma");
const { startOfDay, endOfDay, startOfWeekMonday, endOfWeekMonday } = require("../utils/date");

async function ensureCategoryOwned(userId, categoryId) {
  if (!categoryId) return;
  const c = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!c) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }
}

async function create({ userId, title, content, dueDate, categoryId }) {
  await ensureCategoryOwned(userId, categoryId);

  return prisma.todo.create({
    data: {
      userId,
      title,
      content: content ?? null,
      dueDate: dueDate ?? null,
      categoryId: categoryId ?? null,
    },
    include: { category: true },
  });
}

async function list({ userId, date, filter }) {
  const where = { userId };

  // date=YYYY-MM-DD 우선 적용
  if (date) {
    const d = new Date(`${date}T00:00:00`);
    where.dueDate = { gte: startOfDay(d), lte: endOfDay(d) };
  } else if (filter === "today") {
    const now = new Date();
    where.dueDate = { gte: startOfDay(now), lte: endOfDay(now) };
  } else if (filter === "week") {
    const now = new Date();
    where.dueDate = { gte: startOfWeekMonday(now), lte: endOfWeekMonday(now) };
  }

  return prisma.todo.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: { category: true },
  });
}

async function update({ userId, id, title, content, dueDate, categoryId, isCompleted }) {
  const exists = await prisma.todo.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Todo not found");
    err.statusCode = 404;
    throw err;
  }

  if (categoryId !== undefined) {
    // null이면 카테고리 해제, uuid면 소유권 체크
    await ensureCategoryOwned(userId, categoryId);
  }

  return prisma.todo.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content: content } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(isCompleted !== undefined ? { isCompleted } : {}),
    },
    include: { category: true },
  });
}

async function toggle({ userId, id }) {
  const exists = await prisma.todo.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Todo not found");
    err.statusCode = 404;
    throw err;
  }

  return prisma.todo.update({
    where: { id },
    data: { isCompleted: !exists.isCompleted },
    include: { category: true },
  });
}

async function remove({ userId, id }) {
  const exists = await prisma.todo.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Todo not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.todo.delete({ where: { id } });
}

module.exports = { create, list, update, toggle, remove };
