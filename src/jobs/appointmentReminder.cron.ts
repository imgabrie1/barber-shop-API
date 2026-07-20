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
      const windowEnd = new Date(now.getTime() + 120 * 60 * 1000);

      const upcomingAppointments = await appointmentRepo.find({
        where: {
          status: appointmentStatusEnum.CONFIRMED,
          reminderSent: false,
          startTime: Between(now, windowEnd),
        },
        relations: [
          "client",
          "barber",
          "shop",
          "shop.tenant",
          "appointmentServices",
          "appointmentServices.service",
        ],
      });

      if (upcomingAppointments.length === 0) return;

      const grouped = new Map<string, Appointment[]>();
      for (const appointment of upcomingAppointments) {
        const tenantId = appointment.shop.tenant?.id;
        if (!tenantId) {
          console.warn(
            `[Reminder Cron] Agendamento ${appointment.id} sem tenant na shop, ignorando.`,
          );
          continue;
        }
        const list = grouped.get(tenantId) || [];
        list.push(appointment);
        grouped.set(tenantId, list);
      }

      for (const [tenantId, appointments] of grouped) {
        console.log(
          `[Reminder Cron][${tenantId}] ${appointments.length} lembrete(s) para disparar...`,
        );

        for (const appointment of appointments) {
          const services = appointment.appointmentServices.map(
            (as) => as.service.name,
          );

          let clientOk = false;
          let barberOk = false;

          try {
            await notifyAppointmentReminderClient({
              tenantId,
              clientPhone: appointment.client.phoneNumber,
              clientName: appointment.client.name,
              barberName: appointment.barber.name,
              shopName: appointment.shop.name,
              startTime: appointment.startTime,
            });
            clientOk = true;
          } catch (err) {
            console.error(
              `[Reminder Cron][${tenantId}] Falha ao notificar cliente ${appointment.client.phoneNumber}:`,
              err,
            );
          }

          try {
            await notifyAppointmentReminderBarber({
              tenantId,
              barberPhone: appointment.barber.phoneNumber,
              barberName: appointment.barber.name,
              clientName: appointment.client.name,
              shopName: appointment.shop.name,
              startTime: appointment.startTime,
              services,
            });
            barberOk = true;
          } catch (err) {
            console.error(
              `[Reminder Cron][${tenantId}] Falha ao notificar barbeiro ${appointment.barber.phoneNumber}:`,
              err,
            );
          }

          if (clientOk || barberOk) {
            await appointmentRepo.update(appointment.id, {
              reminderSent: true,
            });
          }
        }
      }
    } catch (err) {
      console.error("[Reminder Cron] Erro ao processar lembretes:", err);
    }
  });

  console.log("[Reminder Cron] ✅ Agendado — lembretes entre 0–120 min antes do horário (a cada 30 min, com retry).");
};
