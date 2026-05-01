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

  defaultBarberCommissionPercentage: z
    .number()
    .min(0, "Porcentagem de comissão deve ser no mínimo 0")
    .max(100, "Porcentagem de comissão deve ser no máximo 100")
    .default(0),
});

export const returnServiceSchema = serviceSchema.extend({
  id: z.string("ID inválido"),
});
export const returnMultipleServiceSchema = serviceSchema.array()

export const createServiceSchema = serviceSchema;
export const updateServiceSchema = serviceSchema.partial();

export const barberServiceCommissionSchema = z.object({
  barberId: z.string().uuid("ID do barbeiro inválido"),
  serviceId: z.string().uuid("ID do serviço inválido"),
  commissionPercentage: z
    .number()
    .min(0, "Porcentagem de comissão deve ser no mínimo 0")
    .max(100, "Porcentagem de comissão deve ser no máximo 100")
    .refine((val) => parseFloat(val.toFixed(2)) === val, {
      message: "Porcentagem de comissão deve ter no máximo 2 casas decimais",
    }),
});
