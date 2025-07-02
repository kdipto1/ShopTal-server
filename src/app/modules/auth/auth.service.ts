import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { JwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import bcrypt from "bcryptjs";
import type { Secret } from "jsonwebtoken";
import { ILoginResponse } from "./auth.interfaces";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

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

  return { accessToken, refreshToken, role };
};

export const AuthService = {
  signup,
  login,
};
