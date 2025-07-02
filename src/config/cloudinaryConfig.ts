import { v2 as cloudinary } from "cloudinary";
import config from ".";

cloudinary.config({
  cloud_name: config.cloudier.name,
  api_key: config.cloudier.key,
  api_secret: config.cloudier.secret,
});

export default cloudinary;
