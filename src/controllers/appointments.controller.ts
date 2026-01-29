import { Request, Response } from "express";
import createAppointmentService from "../services/appointments/createAppointment.service";
import { iAppointment } from "../interfaces/appointments.interface";
import getAppointmentsService from "../services/appointments/getAppointments.service";
import getAppointmentByIDservice from "../services/appointments/getAppointmentByIDservice.service";
import { AppError } from "../errors";
import getMyAppointmentsService from "../services/appointments/getMyAppointments.service";
import roleEnum from "../enum/role.enum";

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

export const getAppointmentsController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const appointments = await getAppointmentsService({
    page,
    limit,
  });
  return res.status(200).json(appointments);
};

export const getAppointmentByIDcontroller = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("loco", 404);
  }
  const user = await getAppointmentByIDservice(id as string);
  return res.status(200).json(user);
};

export const getMyAppointmentsController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const userId = req.id;
  const role = req.role as roleEnum;

  const appointments = await getMyAppointmentsService({
    userId,
    role,
    page,
    limit,
  });
  return res.status(200).json(appointments);
};
