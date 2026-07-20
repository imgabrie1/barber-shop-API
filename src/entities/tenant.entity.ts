import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Shop } from "./shop.entity";
import { User } from "./user.entity";
import { Service } from "./services.entity";

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Shop, (shop) => shop.tenant)
  shops: Shop[];

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Service, (service) => service.tenant)
  services: Service[];
}
