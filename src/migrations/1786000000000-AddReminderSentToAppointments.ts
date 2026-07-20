import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReminderSentToAppointments1786000000000
  implements MigrationInterface
{
  name = "AddReminderSentToAppointments1786000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "reminder_sent" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_APPOINTMENTS_REMINDER" ON "appointments" ("reminder_sent", "startTime") WHERE "status" = 'confirmed'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_APPOINTMENTS_REMINDER"`);
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "reminder_sent"`,
    );
  }
}
