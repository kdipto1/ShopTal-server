import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import httpStatus from "http-status";
const app: Application = express();

app.use(cors());
app.use(cookieParser());

//parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
  next();
});

export default app;
