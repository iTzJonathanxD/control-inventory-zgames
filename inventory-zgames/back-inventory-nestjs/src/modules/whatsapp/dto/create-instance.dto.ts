import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';
export class CreateInstanceDto {
  @IsString()
  @IsNotEmpty()
  instanceName: string;
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @IsOptional()
  @IsArray()
  webhookEvents?: string[];
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
export class UpdateInstanceDto {
  @IsOptional()
  @IsString()
  instanceName?: string;
  @IsOptional()
  @IsString()
  phoneNumber?: string;
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
