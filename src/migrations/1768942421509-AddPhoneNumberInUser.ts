import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneNumberInUser1768942421509 implements MigrationInterface {
    name = 'AddPhoneNumberInUser1768942421509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying(25) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
    }

}
