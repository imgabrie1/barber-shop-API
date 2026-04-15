import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import appointmentStatusEnum from "../../enum/appointmentStatus.enum";

const getRevenueService = async (): Promise<number> => {
  const appointmentRepository = AppDataSource.getRepository(Appointment);

  const completedAppointments = await appointmentRepository.find({
    where: {
      status: appointmentStatusEnum.COMPLETED,
    },
    relations: ["appointmentServices", "appointmentServices.service"],
  });

  let totalRevenue = 0;

  for (const appointment of completedAppointments) {
    for (const appointmentService of appointment.appointmentServices) {
      totalRevenue += Number(appointmentService.service.price);
    }
  }

  return totalRevenue;
};

export default getRevenueService;
