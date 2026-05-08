import { BarberServiceCommission } from "../../entities/barberServiceCommission.entity";
import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { User } from "../../entities/user.entity";
import { AppointmentRevenue } from "../../entities/appointmentRevenue.entity";
import appointmentStatusEnum from "../../enum/appointmentStatus.enum";
import roleEnum from "../../enum/role.enum";
import { AppError } from "../../errors";
import { returnAppointmentSchema } from "../../schemas/appointments.schema";
import { APP_TIME_ZONE, formatDateTimeInTimeZone } from "../../utils/timezone";

const updateAppointmentStatusService = async (
  appointmentID: string,
  newStatus: appointmentStatusEnum,
  userID: string,
  role: roleEnum,
) => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const userRepo = AppDataSource.getRepository(User);

  const appointment = await appointmentRepo
    .createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.barber", "barber")
    .leftJoinAndSelect("appointment.client", "client")
    .leftJoinAndSelect("appointment.shop", "shop")
    .leftJoinAndSelect("appointment.appointmentServices", "as")
    .leftJoinAndSelect("as.service", "service")
    .where("appointment.id = :appointmentID", { appointmentID })
    .getOne();

  if (!appointment) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  if (role === roleEnum.ADMIN) {
  } else if (role === roleEnum.MANAGER) {
    const manager = await userRepo.findOne({
      where: { id: userID },
      relations: ["shop"],
    });
    if (!manager || !manager.shop || appointment.shop.id !== manager.shop.id) {
      throw new AppError("Sem permissão para gerenciar agendamentos de outra loja", 403);
    }
  } else if (role === roleEnum.BARBER) {
    if (appointment.barber.id !== userID) {
      throw new AppError("Sem permissão para alterar o status de agendamentos de outros barbeiros", 403);
    }
  } else {
    throw new AppError("Clientes não podem alterar o status de agendamentos diretamente", 403);
  }

  const validTransitions: Record<
    appointmentStatusEnum,
    appointmentStatusEnum[]
  > = {
    [appointmentStatusEnum.PENDING]: [
      appointmentStatusEnum.PENDING,
      appointmentStatusEnum.CONFIRMED,
      appointmentStatusEnum.CANCELLED,
    ],
    [appointmentStatusEnum.CONFIRMED]: [
      appointmentStatusEnum.CONFIRMED,
      appointmentStatusEnum.COMPLETED,
      appointmentStatusEnum.CANCELLED,
      appointmentStatusEnum.NO_SHOW,
    ],
    [appointmentStatusEnum.COMPLETED]: [appointmentStatusEnum.COMPLETED],
    [appointmentStatusEnum.CANCELLED]: [appointmentStatusEnum.CANCELLED],
    [appointmentStatusEnum.NO_SHOW]: [appointmentStatusEnum.NO_SHOW],
  };

  const currentStatus = appointment.status as appointmentStatusEnum;

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new AppError(
      `Não é possível alterar o status de ${currentStatus} para ${newStatus}`,
      400,
    );
  }

  await AppDataSource.manager.transaction(
    async (transactionalEntityManager) => {
      appointment.status = newStatus;
      await transactionalEntityManager.save(appointment);

      if (
        newStatus === appointmentStatusEnum.COMPLETED &&
        currentStatus !== appointmentStatusEnum.COMPLETED
      ) {
        const appointmentRevenueRepo =
          transactionalEntityManager.getRepository(AppointmentRevenue);
        const barberServiceCommissionRepo =
          transactionalEntityManager.getRepository(BarberServiceCommission);

        for (const appointmentService of appointment.appointmentServices) {
          const customCommission = await barberServiceCommissionRepo.findOne({
            where: {
              barber: { id: appointment.barber.id },
              service: { id: appointmentService.service.id },
            },
          });

          const totalServiceRevenuePaidByClient = Number(
            appointmentService.service.price,
          );

          let barberCommissionPercentageApplied = Number(
            appointmentService.service.defaultBarberCommissionPercentage,
          );

          if (customCommission) {
            barberCommissionPercentageApplied = Number(
              customCommission.commissionPercentage,
            );
          }

          const barberCommissionAmount =
            totalServiceRevenuePaidByClient *
            (barberCommissionPercentageApplied / 100);

          const newAppointmentRevenue = appointmentRevenueRepo.create({
            appointmentId_original: appointment.id,
            appointmentStartTime: appointment.startTime,
            appointmentEndTime: appointment.endTime,
            serviceId_original: appointmentService.service.id,
            serviceName: appointmentService.service.name,
            totalServiceRevenuePaidByClient: totalServiceRevenuePaidByClient,
            barberCommissionPercentageApplied:
              barberCommissionPercentageApplied,
            barberCommissionAmount: barberCommissionAmount,
            barberId_original: appointment.barber.id,
            barberName: appointment.barber.name,
            clientId_original: appointment.client.id,
            shop: appointment.shop,
          });
          await transactionalEntityManager.save(newAppointmentRevenue);
        }
      }
    },
  );

  const formattedAppointment = {
    ...appointment,
    startTime: formatDateTimeInTimeZone(appointment.startTime, APP_TIME_ZONE),
    endTime: formatDateTimeInTimeZone(appointment.endTime, APP_TIME_ZONE),
    services: appointment.appointmentServices.map((as) => as.service),
  };

  return returnAppointmentSchema.parse(formattedAppointment);
};

export default updateAppointmentStatusService;
