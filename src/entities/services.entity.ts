import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Shop } from "./shop.entity";
import { Tenant } from "./tenant.entity";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.services, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

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

  @ManyToMany(() => Shop, (shop) => shop.services, { onDelete: "CASCADE" })
  @JoinTable({
    name: "service_shops",
    joinColumn: { name: "service_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "shop_id", referencedColumnName: "id" },
  })
  shops: Shop[];
}
