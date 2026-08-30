import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Serialize Prisma Decimal fields as JSON numbers (instead of strings) so the
// API contract stays consistent for clients.
const decimalPrototype = Prisma.Decimal.prototype as unknown as {
  toJSON: () => number;
  toNumber: () => number;
};
decimalPrototype.toJSON = function () {
  return this.toNumber();
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set - PrismaClient requires a connection string");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  errorFormat: "minimal",
});

export default prisma;
