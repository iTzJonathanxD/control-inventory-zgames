import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
export class CreateWhatsAppConfigDto {
  @IsString()
  @IsNotEmpty()
  debtMessageTemplate: string;
  @IsOptional()
  @IsString()
  welcomeMessageTemplate?: string;
  @IsOptional()
  @IsString()
  orderConfirmationTemplate?: string;
  @IsOptional()
  @IsBoolean()
  sendDebtReminders?: boolean;
  @IsOptional()
  @IsNumber()
  @Min(1)
  debtReminderDays?: number;
}
export class UpdateWhatsAppConfigDto {
  @IsOptional()
  @IsString()
  debtMessageTemplate?: string;
  @IsOptional()
  @IsString()
  welcomeMessageTemplate?: string;
  @IsOptional()
  @IsString()
  orderConfirmationTemplate?: string;
  @IsOptional()
  @IsBoolean()
  sendDebtReminders?: boolean;
  @IsOptional()
  @IsNumber()
  @Min(1)
  debtReminderDays?: number;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
export class SendDebtMessageDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
  @IsOptional()
  @IsString()
  customMessage?: string;
}
