import nodemailer from "nodemailer";
import config from "../config";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";

const getTransporter = () => {
  const { host, port, user, pass } = config.smtp;
  if (!host || !user || !pass) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Email service is not configured",
    );
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: config.smtp.user,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};
