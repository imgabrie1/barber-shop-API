import { MigrationInterface, QueryRunner } from "typeorm";

export class NewInitialEntities1777316783854 implements MigrationInterface {
    name = 'NewInitialEntities1777316783854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "durationMinutes" integer NOT NULL, "price" numeric(5,2) NOT NULL, "defaultBarberCommissionPercentage" numeric(5,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment_services" ("appointment_id" uuid NOT NULL, "service_id" uuid NOT NULL, CONSTRAINT "PK_0d8cb48b88882567f9bd788b1a0" PRIMARY KEY ("appointment_id", "service_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_SERVICE_SERVICE" ON "appointment_services" ("service_id") `);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'pending', "client_id" uuid, "barber_id" uuid, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_STATUS" ON "appointments" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_START_TIME" ON "appointments" ("startTime") `);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_BARBER" ON "appointments" ("barber_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_APPOINTMENT_CLIENT" ON "appointments" ("client_id") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('client', 'barber', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "phoneNumber" character varying(25) NOT NULL, "password" character varying(125) NOT NULL, "refreshToken" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'client', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_USER_CREATED_AT" ON "users" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_ROLE_ACTIVE" ON "users" ("role", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_ROLE" ON "users" ("role") `);
        await queryRunner.query(`CREATE TABLE "barber_service_commissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "commissionPercentage" numeric(5,2) NOT NULL, "barber_id" uuid, "service_id" uuid, CONSTRAINT "PK_43bb88c91104fc6f96da2ce6d68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a989e39e3efc23d114a73db77d" ON "barber_service_commissions" ("barber_id", "service_id") `);
        await queryRunner.query(`CREATE TABLE "appointment_revenues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointmentId_original" uuid NOT NULL, "appointmentStartTime" TIMESTAMP NOT NULL, "appointmentEndTime" TIMESTAMP NOT NULL, "serviceId_original" uuid NOT NULL, "serviceName" character varying NOT NULL, "totalServiceRevenuePaidByClient" numeric(5,2) NOT NULL, "barberCommissionPercentageApplied" numeric(5,2) NOT NULL, "barberCommissionAmount" numeric(5,2) NOT NULL, "barberId_original" uuid NOT NULL, "barberName" character varying(50) NOT NULL, "clientId_original" uuid NOT NULL, "recordedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0fc80c46b6f9fba8d84225d4a93" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointment_services" ADD CONSTRAINT "FK_923e323e598280a0454e1d1b7cf" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_services" ADD CONSTRAINT "FK_5aafcd787c270f1fd2e01376a6b" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_ccc5bbce58ad6bc96faa428b1e4" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_28d5a251a0d69e60f83044f5a55" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "barber_service_commissions" ADD CONSTRAINT "FK_34ae2bc2ff49582817a44abc7ae" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "barber_service_commissions" ADD CONSTRAINT "FK_194f8ed4058ca84a325d46cf812" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barber_service_commissions" DROP CONSTRAINT "FK_194f8ed4058ca84a325d46cf812"`);
        await queryRunner.query(`ALTER TABLE "barber_service_commissions" DROP CONSTRAINT "FK_34ae2bc2ff49582817a44abc7ae"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_28d5a251a0d69e60f83044f5a55"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_ccc5bbce58ad6bc96faa428b1e4"`);
        await queryRunner.query(`ALTER TABLE "appointment_services" DROP CONSTRAINT "FK_5aafcd787c270f1fd2e01376a6b"`);
        await queryRunner.query(`ALTER TABLE "appointment_services" DROP CONSTRAINT "FK_923e323e598280a0454e1d1b7cf"`);
        await queryRunner.query(`DROP TABLE "appointment_revenues"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a989e39e3efc23d114a73db77d"`);
        await queryRunner.query(`DROP TABLE "barber_service_commissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_ROLE"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_ROLE_ACTIVE"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_CREATED_AT"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_CLIENT"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_BARBER"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_START_TIME"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_STATUS"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_APPOINTMENT_SERVICE_SERVICE"`);
        await queryRunner.query(`DROP TABLE "appointment_services"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }

}
