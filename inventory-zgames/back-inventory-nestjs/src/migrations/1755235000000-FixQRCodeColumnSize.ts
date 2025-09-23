import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixQRCodeColumnSize1755235000000 implements MigrationInterface {
  name = 'FixQRCodeColumnSize1755235000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change qrCode column from VARCHAR(255) to LONGTEXT to accommodate base64 QR codes
    await queryRunner.query(
      `ALTER TABLE \`whatsapp_instances\` MODIFY COLUMN \`qrCode\` LONGTEXT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to VARCHAR(255) - Note: this might cause data loss if QR codes are longer
    await queryRunner.query(
      `ALTER TABLE \`whatsapp_instances\` MODIFY COLUMN \`qrCode\` VARCHAR(255)`,
    );
  }
}
