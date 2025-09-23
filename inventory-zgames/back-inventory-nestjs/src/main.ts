import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from './core/logger/logger.service';
import { corsConfig } from './config/cors.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger(),
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configurar archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors(corsConfig);

  await app.listen(port);

  console.log('\n');
  console.log(
    '\x1b[36m%s\x1b[0m',
    '                    ZGAMES INVENTORY BACKEND                    ',
  );
  console.log(' ');
  console.log(
    '\x1b[32m%s\x1b[0m',
    '               STATUS: Server started successfully',
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `                 URL: http://localhost:${port}/api`,
  );
  console.log('\n');
}
bootstrap();
