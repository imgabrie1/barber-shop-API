import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Shop } from "./shop.entity";
import { Tenant } from "./tenant.entity";

@Entity("appointment_revenues")
export class AppointmentRevenue {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  appointmentId_original: string;

  @Column({ type: "timestamp" })
  appointmentStartTime: Date;

  @Column({ type: "timestamp" })
  appointmentEndTime: Date;

  @Column("uuid")
  serviceId_original: string;

  @Column({ type: "varchar" })
  serviceName: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  totalServiceRevenuePaidByClient: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  barberCommissionPercentageApplied: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  barberCommissionAmount: number;

  @Column("uuid")
  barberId_original: string;

  @Column({ type: "varchar", length: 50 })
  barberName: string;

  @Column("uuid")
  clientId_original: string;

  @ManyToOne(() => Shop, (shop) => shop.revenues, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shop_id" })
  shop: Shop;

  @ManyToOne(() => Tenant, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @CreateDateColumn()
  recordedAt: Date;
}
