import cron from "node-cron";
import { AppDataSource } from "../data-source";
import { Appointment } from "../entities/appointments.entity";
import { Between } from "typeorm";
import appointmentStatusEnum from "../enum/appointmentStatus.enum";
import {
  notifyAppointmentReminderClient,
  notifyAppointmentReminderBarber,
} from "../services/whatsapp/whatsapp.notifications";


export const startAppointmentReminderCron = (): void => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const appointmentRepo = AppDataSource.getRepository(Appointment);

      const now = new Date();

      const windowStart = new Date(now.getTime() + 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 90 * 60 * 1000);

      const upcomingAppointments = await appointmentRepo.find({
        where: {
          status: appointmentStatusEnum.CONFIRMED,
          startTime: Between(windowStart, windowEnd),
        },
        relations: ["client", "barber", "shop", "appointmentServices", "appointmentServices.service"],
      });

      if (upcomingAppointments.length === 0) return;

      console.log(
        `[Reminder Cron] ${upcomingAppointments.length} lembrete(s) para disparar...`
      );

      for (const appointment of upcomingAppointments) {
        const services = appointment.appointmentServices.map(
          (as) => as.service.name
        );

        notifyAppointmentReminderClient({
          clientPhone: appointment.client.phoneNumber,
          clientName: appointment.client.name,
          barberName: appointment.barber.name,
          shopName: appointment.shop.name,
          startTime: appointment.startTime,
        }).catch((err) =>
          console.error(
            `[Reminder Cron] Falha ao notificar cliente ${appointment.client.phoneNumber}:`,
            err
          )
        );

        notifyAppointmentReminderBarber({
          barberPhone: appointment.barber.phoneNumber,
          barberName: appointment.barber.name,
          clientName: appointment.client.name,
          shopName: appointment.shop.name,
          startTime: appointment.startTime,
          services,
        }).catch((err) =>
          console.error(
            `[Reminder Cron] Falha ao notificar barbeiro ${appointment.barber.phoneNumber}:`,
            err
          )
        );
      }
    } catch (err) {
      console.error("[Reminder Cron] Erro ao processar lembretes:", err);
    }
  });

  console.log("[Reminder Cron] ✅ Agendado — lembretes entre 60–90 min antes do horário (a cada 30 min).");
};
