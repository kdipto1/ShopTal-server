import { JwtPayload } from "jsonwebtoken";

interface IUserPayload extends JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user: IUserPayload;
    }
  }
}
