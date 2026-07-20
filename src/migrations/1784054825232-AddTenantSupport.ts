import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantSupport1784054825232 implements MigrationInterface {
  name = "AddTenantSupport1784054825232";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_shops" DROP CONSTRAINT "FK_91567544303390e33b3c629d4b0"`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slug" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `INSERT INTO "tenants" ("name", "slug") VALUES ('Tenant Padrão', 'default')`,
    );

    await queryRunner.query(`ALTER TABLE "services" ADD "tenant_id" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD "tenant_id" uuid`);
    await queryRunner.query(`ALTER TABLE "shops" ADD "tenant_id" uuid`);

    await queryRunner.query(
      `UPDATE "services" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default')`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default')`,
    );
    await queryRunner.query(
      `UPDATE "shops" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default')`,
    );

    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "tenant_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "shops" ALTER COLUMN "tenant_id" SET NOT NULL`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_USER_ROLE_ACTIVE"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('client', 'barber', 'manager', 'admin', 'super_admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'client'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USER_PHONE_TENANT" ON "users" ("phoneNumber", "tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_ROLE_ACTIVE" ON "users" ("role", "isActive") `,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_847c3b57ab049376d3380329a9c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shops" ADD CONSTRAINT "FK_784726aa6910cf3f5eb79723f6c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_shops" ADD CONSTRAINT "FK_91567544303390e33b3c629d4b0" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_shops" DROP CONSTRAINT "FK_91567544303390e33b3c629d4b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shops" DROP CONSTRAINT "FK_784726aa6910cf3f5eb79723f6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_847c3b57ab049376d3380329a9c"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_USER_ROLE_ACTIVE"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USER_PHONE_TENANT"`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum_old" AS ENUM('client', 'barber', 'manager', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'client'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_ROLE_ACTIVE" ON "users" ("isActive", "role") `,
    );
    await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tenant_id"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(
      `ALTER TABLE "service_shops" ADD CONSTRAINT "FK_91567544303390e33b3c629d4b0" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
