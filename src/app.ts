import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { globalRateLimiter } from "./app/middlewares/rateLimit";
import config from "./config";
const app: Application = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
const allowedOrigins = (config.clientUrl || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(globalRateLimiter);

//parser
// Stripe webhook needs the raw body for signature verification, so it must be
// mounted before the JSON parser.
app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.json({ limit: "100kb" }));

import routes from "./app/routes";
app.use("/api/v1", routes);

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello World!");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "Route Not Found",
      },
    ],
  });
});

app.use(globalErrorHandler);

export default app;
