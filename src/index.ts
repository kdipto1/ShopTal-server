import { Server } from "http";
import app from "./app";
import config from "./config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

async function bootstrap() {
  const server: Server = app.listen(config.port, () => {
    app.use(globalErrorHandler);
    console.info(`Server running on port http://localhost:${config.port}/`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed");
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (err: unknown) => {
    console.error(err);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);

  process.on("SIGTERM", () => {
    console.info("SIGTERM received");
    if (server) {
      server.close();
    }
  });
}

bootstrap();
