import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Appointment } from "./appointments.entity";
import { Service } from "./services.entity";
import { AppointmentRevenue } from "./appointmentRevenue.entity";
import { ShopSchedule } from "./shopSchedule.entity";
import { Tenant } from "./tenant.entity";

@Entity("shops")
export class Shop {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.shops, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  alwaysOpen: boolean;

  @OneToMany(() => ShopSchedule, (schedule) => schedule.shop, { cascade: true })
  schedules: ShopSchedule[];

  @OneToMany(() => User, (user) => user.shop)
  users: User[];

  @OneToMany(() => Appointment, (appointment) => appointment.shop)
  appointments: Appointment[];

  @ManyToMany(() => Service, (service) => service.shops)
  services: Service[];

  @OneToMany(() => AppointmentRevenue, (revenue) => revenue.shop)
  revenues: AppointmentRevenue[];
}
