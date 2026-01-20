import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshToken1768942866752 implements MigrationInterface {
    name = 'AddRefreshToken1768942866752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
