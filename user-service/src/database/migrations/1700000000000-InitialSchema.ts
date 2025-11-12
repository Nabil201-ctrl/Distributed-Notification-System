import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
    name = 'InitialSchema1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "user_preferences"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL UNIQUE,
        "password" varchar(255) NOT NULL,
        "push_token" text,
        "role" varchar(20) NOT NULL DEFAULT 'user' 
          CHECK (role IN ('user', 'admin', 'service')),
        "is_active" boolean DEFAULT true,
        "email_verified" boolean DEFAULT false,
        "refresh_token" text,
        "last_login" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_users_role" ON "users" ("role")
    `);

        await queryRunner.query(`
      CREATE TABLE "user_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "email" boolean DEFAULT true,
        "push" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "FK_user_preferences_user" 
          FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
      )
    `);

        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_preferences_user_id" 
      ON "user_preferences" ("user_id")
    `);

        await queryRunner.query(`
      INSERT INTO "users" ("name", "email", "password", "role", "email_verified")
      VALUES (
        'System Admin',
        'admin@notification-system.local',
        '$2a$10$jQSlCLgRX0ksH7/ANxAZ/eIpu/tL.0OU5aCrXdTbl1sx2NS.n5D8O',
        'admin',
        true
      )
    `);

        await queryRunner.query(`
      INSERT INTO "user_preferences" ("user_id", "email", "push")
      SELECT id, true, true FROM "users" WHERE email = 'admin@notification-system.local'
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_user_preferences_user_id"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP INDEX "IDX_users_role"`);
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}