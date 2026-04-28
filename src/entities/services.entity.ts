import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BarberServiceCommission } from "./barberServiceCommission.entity";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "int" })
  durationMinutes: number;

  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price: number;

  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
    default: 0,
  })
  defaultBarberCommissionPercentage: number;

  @OneToMany(
    () => BarberServiceCommission,
    (barberServiceCommission) => barberServiceCommission.service,
  )
  barberServiceCommissions: BarberServiceCommission[];
}
