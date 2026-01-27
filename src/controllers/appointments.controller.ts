import { Request, Response } from "express";
import createAppointmentService from "../services/appointments/CreateAppointment.service";
import { iAppointment } from "../interfaces/appointments.interface";

export const createAppointmentController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const AppointmentData: iAppointment = req.body;
  const clientId = req.id;

  const newAppointment = await createAppointmentService(
    AppointmentData,
    clientId,
  );

  return res.status(201).json(newAppointment);
};
