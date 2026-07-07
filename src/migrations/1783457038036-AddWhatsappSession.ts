import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhatsappSession1783457038036 implements MigrationInterface {
    name = 'AddWhatsappSession1783457038036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "whatsapp_sessions" ("id" character varying NOT NULL, "data" text NOT NULL, CONSTRAINT "PK_3d45009c99e71c709c8587ae4d6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "whatsapp_sessions"`);
    }

}
