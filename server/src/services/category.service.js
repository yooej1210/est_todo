const { prisma } = require("../config/prisma");

async function create({ userId, name, color }) {
  try {
    return await prisma.category.create({
      data: { userId, name, color },
    });
  } catch (e) {
    // UNIQUE(userId, name) 충돌
    const err = new Error("Category name already exists");
    err.statusCode = 409;
    throw err;
  }
}

async function list({ userId }) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

async function update({ userId, id, name, color }) {
  const exists = await prisma.category.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  try {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(color !== undefined ? { color } : {}),
      },
    });
  } catch {
    const err = new Error("Category name already exists");
    err.statusCode = 409;
    throw err;
  }
}

async function remove({ userId, id }) {
  const exists = await prisma.category.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  // Todo.categoryId는 onDelete:SetNull 이라 카테고리 삭제해도 todo는 유지됨
  await prisma.category.delete({ where: { id } });
}

module.exports = { create, list, update, remove };
