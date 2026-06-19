import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Shop } from "./shop.entity";

@Entity("shop_schedules")
export class ShopSchedule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int" })
  dayOfWeek: number;

  @Column({ type: "int", default: 8 })
  startHour: number;

  @Column({ type: "int", default: 18 })
  endHour: number;

  @Column({ default: true })
  isOpen: boolean;

  @ManyToOne(() => Shop, (shop) => shop.schedules, { onDelete: "CASCADE" })
  shop: Shop;
}
