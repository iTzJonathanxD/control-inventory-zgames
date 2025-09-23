import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEvolutionApiFieldsFromWhatsAppConfig1755234000000
  implements MigrationInterface
{
  name = 'RemoveEvolutionApiFieldsFromWhatsAppConfig1755234000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`whatsapp_configs\` DROP COLUMN \`evolutionApiUrl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`whatsapp_configs\` DROP COLUMN \`evolutionApiKey\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the columns if we need to rollback
    await queryRunner.query(
      `ALTER TABLE \`whatsapp_configs\` ADD \`evolutionApiUrl\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`whatsapp_configs\` ADD \`evolutionApiKey\` varchar(255) NOT NULL`,
    );
  }
}
