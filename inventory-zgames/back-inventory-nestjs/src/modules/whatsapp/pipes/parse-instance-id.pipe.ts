import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
@Injectable()
export class ParseInstanceIdPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    if (!value) {
      throw new BadRequestException('Instance ID is required');
    }
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(
        `Instance ID must be a valid number. Received: "${value}"`,
      );
    }
    if (val <= 0) {
      throw new BadRequestException(
        `Instance ID must be a positive number. Received: ${val}`,
      );
    }
    return val;
  }
}
