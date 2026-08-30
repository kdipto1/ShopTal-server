import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { JwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Secret } from "jsonwebtoken";
import { ILoginResponse } from "./auth.interfaces";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { sendEmail } from "../../../helpers/emailHelper";

const signup = async (payload: Prisma.UserCreateInput) => {
  const isUserExists = await prisma.user.findFirst({
    where: {
      OR: [
        {
          phone: payload.phone,
        },
        {
          email: payload.email,
        },
      ],
    },
  });
  if (isUserExists)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User already exits by this contact number or email",
    );
  if (payload) {
    const hashedPassword = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds),
    );

    payload.password = hashedPassword;
  }
  payload.role = "user";
  payload.status = "active";
  const result = await prisma.user.create({
    data: payload,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      address: true,
    },
  });
  await prisma.cart.create({
    data: {
      userId: result.id,
    },
  });
  return result;
};

const login = async (payload: {
  phone: string;
  password: string;
}): Promise<ILoginResponse> => {
  const { phone, password } = payload;

  if (!phone || !password)
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Contact No and Password Required",
    );

  const isUserExists = await prisma.user.findUnique({
    where: {
      phone,
    },
  });
  if (!isUserExists) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (isUserExists.status !== "active") {
    throw new ApiError(httpStatus.FORBIDDEN, "This account is inactive");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password as string,
    isUserExists.password,
  );

  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  }

  const { id: userId, role } = isUserExists;
  const accessToken = JwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );
  const refreshToken = JwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return { accessToken, refreshToken, role, userId };
};

const refreshToken = async (token: string): Promise<ILoginResponse> => {
  if (!token)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is required");

  let verifiedToken;
  try {
    verifiedToken = JwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const { userId, role } = verifiedToken as { userId: string; role: string };

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  if (user.status !== "active")
    throw new ApiError(httpStatus.FORBIDDEN, "This account is inactive");

  const newAccessToken = JwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );
  const newRefreshToken = JwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    role,
    userId,
  };
};

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const forgotPassword = async (payload: {
  email?: string;
  phone?: string;
}): Promise<void> => {
  const { email, phone } = payload;
  if (!email && !phone)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please provide your email or phone number",
    );

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: email || undefined }, { phone: phone || undefined }],
    },
  });

  // Do not reveal whether the account exists.
  if (!user || !user.email) return;
  if (user.status !== "active") return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashToken(rawToken),
      expiresAt,
    },
  });

  const resetUrl = `${config.clientUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "ShopTal — Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #db2777;">Reset your password</h2>
        <p>We received a request to reset your ShopTal password.</p>
        <p>
          <a href="${resetUrl}"
             style="display: inline-block; padding: 10px 20px; background: #db2777; color: #fff; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666;">This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

const resetPassword = async (payload: {
  token: string;
  newPassword: string;
}): Promise<void> => {
  const { token, newPassword } = payload;

  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(token) },
  });

  if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date())
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Reset link is invalid or has expired",
    );

  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, id: { not: storedToken.id }, usedAt: null },
    }),
  ]);
};

export const AuthService = {
  signup,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
