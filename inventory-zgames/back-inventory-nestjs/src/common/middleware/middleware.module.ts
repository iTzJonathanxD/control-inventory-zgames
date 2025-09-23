import { Module } from '@nestjs/common';
import { LoggingMiddleware } from './logging.middleware';

@Module({
  providers: [LoggingMiddleware],
  exports: [LoggingMiddleware],
})
export class MiddlewareModule {}