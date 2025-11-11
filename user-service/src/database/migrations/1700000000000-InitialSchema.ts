import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
    name = 'InitialSchema1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "user_preferences"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

        // Create users table
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

        // Create index on email
        await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

        // Create index on role
        await queryRunner.query(`
      CREATE INDEX "IDX_users_role" ON "users" ("role")
    `);

        // Create user_preferences table
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

        // Create unique index on user_id
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_preferences_user_id" 
      ON "user_preferences" ("user_id")
    `);

        await queryRunner.query(`
        CREATE TABLE "notification_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "email_enabled" boolean DEFAULT true,
        "push_enabled" boolean DEFAULT true,
        "marketing_enabled" boolean DEFAULT true,
        "security_alerts_enabled" boolean DEFAULT true,
        "quiet_hours" json,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "FK_notification_preferences_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
    )
    `);

        // Optional: unique index on user_id
        await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_notification_preferences_user_id"
        ON "notification_preferences" ("user_id")
        `);

        // Create default admin user (password: Admin123!)
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

        // Create preferences for admin
        await queryRunner.query(`
      INSERT INTO "user_preferences" ("user_id", "email", "push")
      SELECT id, true, true FROM "users" WHERE email = 'admin@notification-system.local'
    `);

        await queryRunner.query(`
      INSERT INTO "notification_preferences" ("user_id", "email_enabled", "push_enabled", "marketing_enabled", "security_alerts_enabled")
    SELECT id, true, true, true, true FROM "users" WHERE email = 'admin@notification-system.local';
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