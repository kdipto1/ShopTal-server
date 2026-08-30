import { Prisma, PrismaClient } from "@prisma/client";

// Serialize Prisma Decimal fields as JSON numbers (instead of strings) so the
// API contract stays consistent for clients.
const decimalPrototype = Prisma.Decimal.prototype as unknown as {
  toJSON: () => number;
  toNumber: () => number;
};
decimalPrototype.toJSON = function () {
  return this.toNumber();
};

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

export default prisma;
