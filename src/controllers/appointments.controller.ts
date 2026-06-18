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
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userID = req.id;
    const role = req.role as roleEnum;

    const updated = await updateAppointmentStatusService(
      id as string,
      status,
      userID as string,
      role,
    );
    return res.status(200).json(updated);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const userCancelAppointmentController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req;
  const appointmentID = req.params.id;
  const cancelled = await userCancelAppointmentService(
    appointmentID as string,
    id as string,
  );
  return res.status(200).json(cancelled);
};

export const getAppointmentsController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const { date, barberId } = req.query;

  const userID = req.id;
  const role = req.role as roleEnum;

  const appointments = await getAppointmentsService({
    page,
    limit,
    date: date as string,
    barberId: barberId as string,
    userID: userID as string,
    role,
  });
  return res.status(200).json(appointments);
};

export const getAppointmentByIDcontroller = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const userID = req.id;
  const role = req.role as roleEnum;

  if (!id) {
    throw new AppError("ID do agendamento é obrigatório", 400);
  }
  const appointment = await getAppointmentByIDservice(
    id as string,
    userID as string,
    role,
  );
  return res.status(200).json(appointment);
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
    userId: userId as string,
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
  const role = req.role as roleEnum;

  await deleteAppointmentService(userID as string, appointmentID, role);

  return res.status(204).send();
};

export const checkAvailabilityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { barberId, shopId, date, serviceIds, durationMinutes, slotMinutes } = req.query;

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
    shopId?: string;
    date?: string;
    serviceIds?: string[];
    durationMinutes?: number;
    slotMinutes?: number;
  } = {
    barberId: barberId as string,
    shopId: shopId as string,
    date: date as string,
  };

  if (normalizedServiceIds && normalizedServiceIds.length > 0) {
    availabilityRequest.serviceIds = normalizedServiceIds;
  }

  if (parsedDurationMinutes !== undefined && Number.isFinite(parsedDurationMinutes)) {
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
  const userID = req.id;
  const role = req.role as roleEnum;

  let updatedData = { ...req.body };

  const appointment = await patchAppointmentService(
    updatedData,
    appointmentID,
    userID as string,
    role,
  );

  return res.status(200).json(appointment);
};
