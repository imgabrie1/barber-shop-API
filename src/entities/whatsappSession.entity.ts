import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("whatsapp_sessions")
export class WhatsappSession {
  @PrimaryColumn({ type: "varchar" })
  id: string;

  @Column({ type: "text" })
  data: string;
}
