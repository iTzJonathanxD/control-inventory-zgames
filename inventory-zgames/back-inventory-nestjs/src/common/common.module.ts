import { Module } from '@nestjs/common';
import { SmsService } from './services/sms.service';
import { FileUploadService } from './services/file-upload.service';
import { FilesController } from './controllers/files.controller';

@Module({
  controllers: [FilesController],
  providers: [SmsService, FileUploadService],
  exports: [SmsService, FileUploadService],
})
export class CommonModule {}
