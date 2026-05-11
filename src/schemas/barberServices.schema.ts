import z, { string } from "zod";

export const shopSchema = z.object({
  name: z.string(),
  address: z.string(),
  businessStartHour: z.number(),
  businessEndHour: z.number(),
});

export const updateShopSchema = shopSchema.partial();

export const returnShopSchema = shopSchema.extend({
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
