const categoryService = require("../services/category.service");

async function create(req, res) {
  const userId = req.user.id;
  const { name, color } = req.validated.body;
  const category = await categoryService.create({ userId, name, color });
  res.status(201).json({ category });
}

async function list(req, res) {
  const userId = req.user.id;
  const categories = await categoryService.list({ userId });
  res.json({ categories });
}

async function update(req, res) {
  const userId = req.user.id;
  const { id } = req.validated.params;
  const { name, color } = req.validated.body;
  const category = await categoryService.update({ userId, id, name, color });
  res.json({ category });
}

async function remove(req, res) {
  const userId = req.user.id;
  const { id } = req.validated.params;
  await categoryService.remove({ userId, id });
  res.json({ message: "Deleted" });
}

module.exports = { create, list, update, remove };
