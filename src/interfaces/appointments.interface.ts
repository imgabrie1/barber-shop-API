import { Repository } from "typeorm";
import z from "zod";
import { Appointment } from "../entities/appointments.entity";
import { createAppointmentSchema, updateAppointmentSchema, returnAppointmentSchema, appointmentResponseSchema, appointmentParamsSchema } from "../schemas/appointments.schema";

export type iAppointment = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type iAppointmentReturn = z.infer<typeof returnAppointmentSchema>;
export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>;
export type AppointmentParams = z.infer<typeof appointmentParamsSchema>;

export type iRepoAppointment = Repository<Appointment>;