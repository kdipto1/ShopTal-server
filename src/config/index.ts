import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY,
  },
  cloudier: {
    name: process.env.CLOUDINARY_cloud_name,
    key: process.env.CLOUDINARY_api_key,
    secret: process.env.CLOUDINARY_api_secret,
  },
};
