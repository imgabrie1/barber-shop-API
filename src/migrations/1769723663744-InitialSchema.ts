import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1769723663744 implements MigrationInterface {
    name = 'InitialSchema1769723663744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_START_TIME" ON "appointments" ("startTime") `);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_BARBER" ON "appointments" ("barber_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_CLIENT" ON "appointments" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_CREATED_AT" ON "users" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_ROLE_ACTIVE" ON "users" ("role", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_ROLE" ON "users" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_SERVICE_SERVICE" ON "appointment_services" ("service_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_SERVICE_SERVICE"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_ROLE"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_ROLE_ACTIVE"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_CREATED_AT"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_CLIENT"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_BARBER"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_START_TIME"`);
    }

}
