import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueTrueInPhoneNumber1768943420832 implements MigrationInterface {
    name = 'AddUniqueTrueInPhoneNumber1768943420832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293"`);
    }

}
