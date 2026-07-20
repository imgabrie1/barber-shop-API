import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantToAppointmentsAndRevenue1785500000000
  implements MigrationInterface
{
  name = "AddTenantToAppointmentsAndRevenue1785500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "tenant_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_revenues" ADD "tenant_id" uuid`,
    );

    await queryRunner.query(
      `UPDATE "appointments" SET "tenant_id" = "shop"."tenant_id" FROM "shops" "shop" WHERE "appointments"."shop_id" = "shop"."id"`,
    );
    await queryRunner.query(
      `UPDATE "appointment_revenues" SET "tenant_id" = "shop"."tenant_id" FROM "shops" "shop" WHERE "appointment_revenues"."shop_id" = "shop"."id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "tenant_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_revenues" ALTER COLUMN "tenant_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_revenues" ADD CONSTRAINT "FK_revenues_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment_revenues" DROP CONSTRAINT "FK_revenues_tenant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_tenant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_revenues" DROP COLUMN "tenant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "tenant_id"`,
    );
  }
}
