import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';
import { PartialType } from "@nestjs/mapped-types"
import { CreateUserDto } from "./create-user.dto"
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  firstName?: string;
  @IsOptional()
  @IsString()
  lastName?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  roleId?: number;
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
  @IsOptional()
  @IsString()
  profileImage?: string;
}
