import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import httpStatus from "http-status";
import config from "./config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
const app: Application = express();

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

//parser
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.json({ limit: "100kb" }));

import routes from "./app/routes";
app.use("/api/v1", routes);

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello World!");
});

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
