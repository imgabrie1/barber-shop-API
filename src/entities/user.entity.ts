import { getRounds, hashSync } from "bcryptjs";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from "typeorm";
import roleEnum from "../enum/role.enum";
import { Appointment } from "./appointments.entity";

@Entity("users")
@Index("IDX_USER_ROLE", ["role"])
@Index("IDX_USER_ROLE_ACTIVE", ["role", "isActive"])
@Index("IDX_USER_CREATED_AT", ["createdAt"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50 })
  name: string;

  @Column({ type: "varchar", length: 25, unique: true })
  phoneNumber: string;

  @Column({ type: "varchar", length: 125 })
  password: string;

  @Column({ type: "varchar", nullable: true })
  refreshToken: string;

  @Column({ type: "enum", enum: roleEnum, default: roleEnum.CLIENT })
  role: roleEnum;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.client)
  clientAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.barber)
  barberAppointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (!getRounds(this.password)) {
      this.password = hashSync(this.password, 10);
    }
  }

  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}
