import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { AppointmentService } from "./appointmentServices.entity";
import appointmentStatusEnum from "../enum/appointmentStatus.enum";

@Entity("appointments")
@Index("IDX_APPOINTMENT_CLIENT", ["client"])
@Index("IDX_APPOINTMENT_BARBER", ["barber"])
@Index("IDX_APPOINTMENT_START_TIME", ["startTime"])
@Index("IDX_APPOINTMENT_STATUS", ["status"])
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({
    type: "enum",
    enum: appointmentStatusEnum,
    default: appointmentStatusEnum.PENDING,
  })
  status: appointmentStatusEnum;

  @ManyToOne(() => User, (user) => user.clientAppointments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "client_id" })
  client: User;

  @ManyToOne(() => User, (user) => user.barberAppointments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "barber_id" })
  barber: User;

  @OneToMany(() => AppointmentService, (as) => as.appointment)
  appointmentServices: AppointmentService[];
}
