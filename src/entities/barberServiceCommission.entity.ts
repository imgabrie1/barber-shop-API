import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";
import { Service } from "./services.entity";

@Entity("barber_service_commissions")
@Index(["barber", "service"], { unique: true })
export class BarberServiceCommission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "barber_id" })
  barber: User;

  @ManyToOne(() => Service)
  @JoinColumn({ name: "service_id" })
  service: Service;

  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  commissionPercentage: number;
}
