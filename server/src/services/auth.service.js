const bcrypt = require("bcrypt");
const { prisma } = require("../config/prisma");
const { redis } = require("../config/redis");
const { signAccessToken, signRefreshToken, verifyRefresh } = require("../utils/jwt");

function refreshKey(userId) {
  return `refresh:${userId}`;
}

async function signup({ email, nickname, password }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    const err = new Error("Email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, nickname, password: hashed },
    select: { id: true, email: true, nickname: true, createdAt: true },
  });

  return { user };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  // Redis에 refresh 저장 (기존 토큰 덮어쓰기)
  const ttl = Number(process.env.REFRESH_TOKEN_TTL_SEC || 1209600);
  await redis.set(refreshKey(user.id), refreshToken, { EX: ttl });

  return {
    user: { id: user.id, email: user.email, nickname: user.nickname },
    accessToken,
    refreshToken,
  };
}

async function refresh({ refreshToken }) {
  let decoded;
  try {
    decoded = verifyRefresh(refreshToken);
  } catch {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    throw err;
  }

  const userId = decoded.userId;

  const saved = await redis.get(refreshKey(userId));
  if (!saved || saved !== refreshToken) {
    const err = new Error("Refresh token expired or revoked");
    err.statusCode = 401;
    throw err;
  }

  // 회전(rotate): 새 refresh 발급 + Redis 갱신
  const newAccess = signAccessToken({ userId, email: decoded.email });
  const newRefresh = signRefreshToken({ userId, email: decoded.email });

  const ttl = Number(process.env.REFRESH_TOKEN_TTL_SEC || 1209600);
  await redis.set(refreshKey(userId), newRefresh, { EX: ttl });

  return { accessToken: newAccess, refreshToken: newRefresh };
}

async function logout({ userId }) {
  await redis.del(refreshKey(userId));
}

module.exports = { signup, login, refresh, logout };
