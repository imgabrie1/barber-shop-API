import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { Appointment } from "./appointments.entity";
import { Service } from "./services.entity";

@Entity("appointment_services")
export class AppointmentService {
  @PrimaryColumn("uuid")
  appointment_id: string;

  @PrimaryColumn("uuid")
  service_id: string;

  @ManyToOne(() => Appointment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "appointment_id" })
  appointment: Appointment;

  @ManyToOne(() => Service, { onDelete: "CASCADE" })
  @JoinColumn({ name: "service_id" })
  service: Service;
}
