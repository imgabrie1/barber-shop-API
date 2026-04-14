import { Request, Response } from "express";
import roleEnum from "../enum/role.enum";
import { AppError } from "../errors";
import { iAppointment } from "../interfaces/appointments.interface";
import createAppointmentService from "../services/appointments/createAppointment.service";
import deleteAppointmentService from "../services/appointments/deleteAppointment.service";
import checkAvailabilityService from "../services/appointments/get/checkAvailability.service";
import getAppointmentByIDservice from "../services/appointments/get/getAppointmentByIDservice.service";
import getAppointmentsService from "../services/appointments/get/getAppointments.service";
import getMyAppointmentsService from "../services/appointments/get/getMyAppointments.service";
import patchAppointmentService from "../services/appointments/patchAppointment.service";
import updateAppointmentStatusService from "../services/appointments/updateAppointmentStatus.service";
import userCancelAppointmentService from "../services/appointments/userCancelled.service";

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

export const updateAppointmentStatusController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { status } = req.body;
  const userID = req.id;
  const userRole = req.role;
  const updated = await updateAppointmentStatusService(
    id as string,
    status,
    userID,
    userRole,
  );
  return res.status(200).json(updated);
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
  const appointmentID = req.params.id as string;
  const userID = req.id;

  await deleteAppointmentService(userID, appointmentID);

  return res.status(204).send();
};

export const checkAvailabilityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { barberId, date, serviceIds, durationMinutes, slotMinutes } =
    req.query;

  let normalizedServiceIds: string[] | undefined;
  if (Array.isArray(serviceIds)) {
    normalizedServiceIds = serviceIds.map(String).filter(Boolean);
  } else if (typeof serviceIds === "string") {
    normalizedServiceIds = serviceIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  const parsedDurationMinutes =
    typeof durationMinutes === "string" && durationMinutes.trim() !== ""
      ? Number(durationMinutes)
      : undefined;
  const parsedSlotMinutes =
    typeof slotMinutes === "string" && slotMinutes.trim() !== ""
      ? Number(slotMinutes)
      : undefined;

  const availabilityRequest: {
    barberId?: string;
    date?: string;
    serviceIds?: string[];
    durationMinutes?: number;
    slotMinutes?: number;
  } = {
    barberId: barberId as string,
    date: date as string,
  };

  if (normalizedServiceIds && normalizedServiceIds.length > 0) {
    availabilityRequest.serviceIds = normalizedServiceIds;
  }

  if (
    parsedDurationMinutes !== undefined &&
    Number.isFinite(parsedDurationMinutes)
  ) {
    availabilityRequest.durationMinutes = parsedDurationMinutes;
  }

  if (parsedSlotMinutes !== undefined && Number.isFinite(parsedSlotMinutes)) {
    availabilityRequest.slotMinutes = parsedSlotMinutes;
  }

  const availableSlots = await checkAvailabilityService(availabilityRequest);

  return res.status(200).json(availableSlots);
};

export const patchAppointmentController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const appointmentID = req.params.id as string;

  const { id } = req;

  let updatedData = { ...req.body };

  const appointment = await patchAppointmentService(
    updatedData,
    appointmentID,
    id as string,
  );

  return res.status(200).json(appointment);
};
