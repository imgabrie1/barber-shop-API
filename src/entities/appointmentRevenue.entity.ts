import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import appointmentStatusEnum from "../enum/appointmentStatus.enum";

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


  @CreateDateColumn()
  recordedAt: Date;
}
