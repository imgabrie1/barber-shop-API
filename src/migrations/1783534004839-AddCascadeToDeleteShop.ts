import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeToDeleteShop1783534004839 implements MigrationInterface {
    name = 'AddCascadeToDeleteShop1783534004839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_39e0ab619d2865a101db749751a"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_39e0ab619d2865a101db749751a" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_shops" DROP CONSTRAINT "FK_91567544303390e33b3c629d4b0"`);
        await queryRunner.query(`ALTER TABLE "service_shops" ADD CONSTRAINT "FK_91567544303390e33b3c629d4b0" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_shops" DROP CONSTRAINT "FK_91567544303390e33b3c629d4b0"`);
        await queryRunner.query(`ALTER TABLE "service_shops" ADD CONSTRAINT "FK_91567544303390e33b3c629d4b0" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_39e0ab619d2865a101db749751a"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_39e0ab619d2865a101db749751a" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
