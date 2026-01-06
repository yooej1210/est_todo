const authService = require("../services/auth.service");

async function signup(req, res) {
  console.log("SIGNUP BODY:", req.body);
  const { email, nickname, password } = req.validated.body;
  const result = await authService.signup({ email, nickname, password });
  res.status(201).json(result);
}

async function login(req, res) {
  const { email, password } = req.validated.body;
  const result = await authService.login({ email, password });
  res.json(result);
}

async function refresh(req, res) {
  const { refreshToken } = req.validated.body;
  const result = await authService.refresh({ refreshToken });
  res.json(result);
}

async function logout(req, res) {
  const userId = req.user.id;
  await authService.logout({ userId });
  res.json({ message: "Logged out" });
}

module.exports = { signup, login, refresh, logout };
