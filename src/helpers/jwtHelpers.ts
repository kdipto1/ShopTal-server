import jwt, { Secret } from "jsonwebtoken";

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string,
): string => {
  return jwt.sign(payload, secret, { expiresIn: expireTime });
};

const verifyToken = (
  token: string,
  secret: Secret,
): string | jwt.JwtPayload => {
  const decoded = jwt.verify(token, secret);
  return decoded;
};

export const JwtHelpers = {
  createToken,
  verifyToken,
};
