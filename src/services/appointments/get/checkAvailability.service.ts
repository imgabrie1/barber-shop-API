import { Between } from "typeorm";
import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";


interface iCheckAvailabilityRequest {
  barberId?: string;
  date?: string; // yyyy-mm-dd
}

const checkAvailabilityService = async ({
  barberId,
  date,
}: iCheckAvailabilityRequest): Promise<string[]> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const where: any = {};

  if (barberId) {
    where.barber = { id: barberId };
  }

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);
    where.startTime = Between(startOfDay, endOfDay);
  }

  const existingAppointments = await appointmentRepo.find({
    where,
    order: { startTime: "ASC" },
  });

  const busySlots = existingAppointments.map((appointment) => {
    return new Date(appointment.startTime).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
  });

  return busySlots;
};

export default checkAvailabilityService;
