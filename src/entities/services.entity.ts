import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { BarberServiceCommission } from "./barberServiceCommission.entity";
import { Shop } from "./shop.entity";

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

  @ManyToMany(() => Shop, (shop) => shop.services)
  @JoinTable({
    name: "service_shops",
    joinColumn: { name: "service_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "shop_id", referencedColumnName: "id" },
  })
  shops: Shop[];

  @OneToMany(
    () => BarberServiceCommission,
    (barberServiceCommission) => barberServiceCommission.service,
  )
  barberServiceCommissions: BarberServiceCommission[];
}
