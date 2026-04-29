import { string, z } from "zod";
import roleEnum from "../enum/role.enum";
import { APP_TIME_ZONE, formatDateTimeInTimeZone } from "../utils/timezone";

export const phoneNumberSchema = z
  .string()
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length >= 10 && val.length <= 15, {
    message: "Telefone deve ter entre 10 e 15 dígitos",
  });

export const userSchema = z.object({
  name: z.string().max(50),
  phoneNumber: phoneNumberSchema,
  role: z.enum(roleEnum).default(roleEnum.CLIENT),
  password: z.string().max(120),
  isActive: z.boolean().default(true),
});

export const returnUserSchema = userSchema
  .extend({
    id: z.string(),
  })
  .omit({ password: true });

export const returnUserSchemaComplete = returnUserSchema.extend({
  createdAt: z
    .date()
    .or(z.string())
    .transform((val) => formatDateTimeInTimeZone(new Date(val), APP_TIME_ZONE)),
  updatedAt: z
    .date()
    .or(z.string())
    .transform((val) => formatDateTimeInTimeZone(new Date(val), APP_TIME_ZONE)),
});

export const returnUserInAppoitments = returnUserSchema.omit({ role: true, isActive: true });

export const returnMultipleUserSchema = returnUserSchemaComplete.array();