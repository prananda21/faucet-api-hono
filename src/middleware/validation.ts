import { zValidator } from "@hono/zod-validator";
import { transactionSchema } from "../utils/validation/schema";

export const transactionValidatorMiddleware = zValidator('json', transactionSchema)