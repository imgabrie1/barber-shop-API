import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Appointment } from "./appointments.entity";
import { Service } from "./services.entity";
import { AppointmentRevenue } from "./appointmentRevenue.entity";

@Entity("shops")
export class Shop {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "int", default: 8 })
  businessStartHour: number;

  @Column({ type: "int", default: 18 })
  businessEndHour: number;

  @OneToMany(() => User, (user) => user.shop)
  users: User[];

  @OneToMany(() => Appointment, (appointment) => appointment.shop)
  appointments: Appointment[];

  @ManyToMany(() => Service, (service) => service.shops)
  services: Service[];

  @OneToMany(() => AppointmentRevenue, (revenue) => revenue.shop)
  revenues: AppointmentRevenue[];
}
