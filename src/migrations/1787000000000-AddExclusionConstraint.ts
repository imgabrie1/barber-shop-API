import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExclusionConstraint1787000000000 implements MigrationInterface {
  name = "AddExclusionConstraint1787000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "btree_gist"`);

    await queryRunner.query(`
      WITH conflicting_pairs AS (
        SELECT a.id AS id_to_keep, b.id AS id_to_delete
        FROM "appointments" a
        JOIN "appointments" b ON
          a."barber_id" = b."barber_id"
          AND a."tenant_id" = b."tenant_id"
          AND a."startTime" < b."endTime"
          AND a."endTime" > b."startTime"
          AND a.id < b.id
          AND a.status IN ('pending', 'confirmed')
          AND b.status IN ('pending', 'confirmed')
      )
      DELETE FROM "appointments"
      WHERE id IN (SELECT id_to_delete FROM conflicting_pairs)
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "CK_APPOINTMENT_NO_BARBER_OVERLAP"
      EXCLUDE USING gist (
        "barber_id" WITH =,
        "tenant_id" WITH =,
        tsrange("startTime", "endTime") WITH &&
      ) WHERE (status IN ('pending', 'confirmed'))
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "CK_APPOINTMENT_NO_CLIENT_OVERLAP"
      EXCLUDE USING gist (
        "client_id" WITH =,
        "tenant_id" WITH =,
        tsrange("startTime", "endTime") WITH &&
      ) WHERE (status IN ('pending', 'confirmed'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "CK_APPOINTMENT_NO_CLIENT_OVERLAP"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "CK_APPOINTMENT_NO_BARBER_OVERLAP"`,
    );
  }
}
