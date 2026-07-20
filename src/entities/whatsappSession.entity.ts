import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Tenant } from "./tenant.entity";

@Entity("whatsapp_sessions")
export class WhatsappSession {
  @PrimaryColumn({ type: "varchar" })
  id: string;

  @PrimaryColumn({ type: "uuid", name: "tenant_id" })
  tenantId: string;

  @Column({ type: "text" })
  data: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;
}
