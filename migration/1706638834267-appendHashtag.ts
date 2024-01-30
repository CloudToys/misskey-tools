import {MigrationInterface, QueryRunner} from 'typeorm';

export class appendHashtag1706638834267 implements MigrationInterface {
  name = 'appendHashtag1706638834267';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" ADD "appendHashtag" boolean NOT NULL DEFAULT true');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "appendHashtag"');
  }
}
