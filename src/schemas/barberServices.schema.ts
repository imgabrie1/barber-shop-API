import z from "zod";

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
});

export const returnServiceSchema = serviceSchema.extend({
  id: z.string("ID inválido"),
});
export const returnMultipleServiceSchema = serviceSchema.array()

export const createServiceSchema = serviceSchema;
export const updateServiceSchema = serviceSchema.partial();
