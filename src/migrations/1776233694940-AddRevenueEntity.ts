import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRevenueEntity1776233694940 implements MigrationInterface {
    name = 'AddRevenueEntity1776233694940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "appointment_revenues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointmentId_original" uuid NOT NULL, "appointmentStartTime" TIMESTAMP NOT NULL, "appointmentEndTime" TIMESTAMP NOT NULL, "serviceId_original" uuid NOT NULL, "serviceName" character varying NOT NULL, "priceAtCompletion" numeric(5,2) NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "totalServiceRevenue" numeric(5,2) NOT NULL, "barberId_original" uuid NOT NULL, "barberName" character varying(50) NOT NULL, "clientId_original" uuid NOT NULL, "recordedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0fc80c46b6f9fba8d84225d4a93" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "appointment_revenues"`);
    }

}
