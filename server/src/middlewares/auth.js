const { redis } = require("../config/redis");
const { verifyAccess } = require("../utils/jwt");

async function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyAccess(token);
    const jti = decoded.jti;

    if (jti) {
      const blocked = await redis.get(`bl:access:${jti}`);
      if (blocked) {
        return res.status(401).json({ message: "Token revoked" });
      }
    }

    req.user = { id: decoded.userId, email: decoded.email, jti, exp: decoded.exp };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authRequired };
