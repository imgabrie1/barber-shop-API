import z, { string } from "zod";

export const scheduleSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startHour: z.number().int().min(0).max(23).default(8),
  endHour: z.number().int().min(0).max(23).default(18),
  isOpen: z.boolean().default(true),
});

export const shopBaseSchema = z.object({
  name: z.string(),
  address: z.string(),
  alwaysOpen: z.boolean().default(false),
  schedules: z.array(scheduleSchema).optional(),
});

export const shopSchema = shopBaseSchema;

export const updateShopSchema = shopBaseSchema.partial();

export const returnShopSchema = shopBaseSchema.extend({
  id: z.string(),
});

export const returnMultipleShopSchema = returnShopSchema.array()

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome não pode exceder 50 caracteres"),

  durationMinutes: z
    .number()
    .int("Duração deve ser um número inteiro")
    .positive("Duração deve ser positiva"),

  price: z
    .number()
    .positive("Preço deve ser positivo")
    .max(999.99, "Preço máximo é 999.99"),

  defaultBarberCommissionPercentage: z
    .number()
    .min(0, "Porcentagem de comissão deve ser no mínimo 0")
    .max(100, "Porcentagem de comissão deve ser no máximo 100")
    .default(0),

  shopId: z.string().or(z.array(z.string())).optional(),
});

export const returnServiceSchema = serviceSchema
  .extend({
    id: z.string("ID inválido"),
    shops: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  })
  .omit({ shopId: true });

export const returnMultipleServiceSchema = returnServiceSchema.array();

export const createServiceSchema = serviceSchema;
export const updateServiceSchema = serviceSchema.partial();
