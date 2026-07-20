import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantToWhatsappSession1785000000000 implements MigrationInterface {
  name = "AddTenantToWhatsappSession1785000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "whatsapp_sessions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" DROP CONSTRAINT "PK_3d45009c99e71c709c8587ae4d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD "tenant_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "PK_whatsapp_sessions" PRIMARY KEY ("id", "tenant_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "FK_whatsapp_sessions_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" DROP CONSTRAINT "FK_whatsapp_sessions_tenant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" DROP CONSTRAINT "PK_whatsapp_sessions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" DROP COLUMN "tenant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "PK_3d45009c99e71c709c8587ae4d6" PRIMARY KEY ("id")`,
    );
  }
}
