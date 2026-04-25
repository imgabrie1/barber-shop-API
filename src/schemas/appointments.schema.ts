import z from "zod";
import { returnUserInAppoitments } from "./users.schema";
import { returnServiceSchema } from "./barberServices.schema";

import appointmentStatusEnum from "../enum/appointmentStatus.enum";
import { toUtcDate, APP_TIME_ZONE } from "../utils/timezone";

export const appointmentBaseSchema = z.object({
  startTime: z.date().or(z.string()),
  endTime: z.date().or(z.string()),
  clientId: z.string().optional(),
  barberId: z.string().optional(),
  status: z.nativeEnum(appointmentStatusEnum).optional(),
});

export const createAppointmentSchema = z.object({
  startTime: z.string().or(z.date()),
  barberId: z.string(),
  serviceIds: z.array(z.string()).min(1, "Selecione pelo menos um serviço"),
});

export const updateAppointmentSchema = appointmentBaseSchema
  .partial()
  .extend({
    id: z.string().optional(),
    serviceIds: z.array(z.string()).min(1, "Selecione pelo menos um serviço").optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = toUtcDate(data.startTime, APP_TIME_ZONE);
        const end = toUtcDate(data.endTime, APP_TIME_ZONE);
        return end > start;
      }
      return true;
    },
    {
      message: "A hora de término deve ser posterior à hora de início",
      path: ["endTime"],
    },
  );

export const returnAppointmentSchema = z.object({
  id: z.string(),
  startTime: z.date().or(z.string()),
  endTime: z.date().or(z.string()),
  status: z.enum(appointmentStatusEnum),
  client: returnUserInAppoitments.optional(),
  barber: returnUserInAppoitments.optional(),
  services: z.array(returnServiceSchema)
});

export const appointmentResponseSchema = returnAppointmentSchema;

export const appointmentParamsSchema = z.object({
  id: z.string(),
});