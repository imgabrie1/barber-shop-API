import { Request, Response } from "express";
import createAppointmentService from "../services/appointments/createAppointment.service";
import { iAppointment } from "../interfaces/appointments.interface";
import getAppointmentsService from "../services/appointments/getAppointments.service";
import getAppointmentByIDservice from "../services/appointments/getAppointmentByIDservice.service";
import { AppError } from "../errors";
import getMyAppointmentsService from "../services/appointments/getMyAppointments.service";
import roleEnum from "../enum/role.enum";
import deleteAppointmentService from "../services/appointments/deleteAppointment.service";
import checkAvailabilityService from "../services/appointments/checkAvailability.service";
import patchAppointmentService from "../services/appointments/patchAppointment.service";

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
  const { date, barberId } = req.query;

  const appointments = await getAppointmentsService({
    page,
    limit,
    date: date as string,
    barberId: barberId as string,
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

export const deleteAppointmentController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const appointmentID = req.params.appointmentID;
  const userID = req.id;

  await deleteAppointmentService(userID, appointmentID as string);

  return res.status(204).send();
};

export const checkAvailabilityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { barberId, date } = req.query;

  const availableSlots = await checkAvailabilityService({
    barberId: barberId as string,
    date: date as string,
  });

  return res.status(200).json(availableSlots);
};

export const patchAppointmentController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  let updatedData = { ...req.body };

  const appointment = await patchAppointmentService(updatedData, id as string);

  return res.status(200).json(appointment);
};
