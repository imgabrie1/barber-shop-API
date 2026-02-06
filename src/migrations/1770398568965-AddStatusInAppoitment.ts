import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusInAppoitment1770398568965 implements MigrationInterface {
    name = 'AddStatusInAppoitment1770398568965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_STATUS" ON "appointments" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_STATUS"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    }

}
