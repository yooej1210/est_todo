const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

function signAccessToken(payload) {
  return jwt.sign({ ...payload, jti: uuidv4() }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: Number(process.env.REFRESH_TOKEN_TTL_SEC || 1209600),
  });
}

function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh };
