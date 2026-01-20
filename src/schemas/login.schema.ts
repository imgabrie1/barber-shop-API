import { z } from "zod";
import { phoneNumberSchema } from "./users.schema";



export const createLoginSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: z.string().min(4).max(120),
});
