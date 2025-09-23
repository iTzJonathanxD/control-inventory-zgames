import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppInstance } from './entities/whatsapp-instance.entity';
import { WhatsAppConfig } from './entities/whatsapp-config.entity';
import { WhatsAppService } from './whatsapp.service';
import { EvolutionApiService } from './services/evolution-api.service';
import { WhatsAppController } from './whatsapp.controller';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsAppInstance, WhatsAppConfig]),
    HttpModule,
    UsersModule,
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, EvolutionApiService],
  exports: [WhatsAppService, EvolutionApiService],
})
export class WhatsAppModule {}
