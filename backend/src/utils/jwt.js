import jwt from "jsonwebtoken";

const SECRET = () => process.env.JWT_SECRET || "dev-secret";

export function signToken(payload, expiresIn) {
  return jwt.sign(payload, SECRET(), { expiresIn: expiresIn || "1d" });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET());
}
