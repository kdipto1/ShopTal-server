import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expireTime: string,
): string => {
  const options: SignOptions = {
    expiresIn: expireTime as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token");
  }
  return decoded as JwtPayload;
};

export const JwtHelpers = {
  createToken,
  verifyToken,
};
