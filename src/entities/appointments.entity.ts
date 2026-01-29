import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";

@Entity("appointments")
@Index("IDX_APPOINTMENT_CLIENT", ["client"])
@Index("IDX_APPOINTMENT_BARBER", ["barber"])
@Index("IDX_APPOINTMENT_START_TIME", ["startTime"])
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

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
}
