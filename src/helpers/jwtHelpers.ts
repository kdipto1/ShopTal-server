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
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("Invalid Token");
  }
};

export const JwtHelpers = {
  createToken,
  verifyToken,
};
