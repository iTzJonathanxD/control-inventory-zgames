import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsBoolean, IsUUID, IsNumber, isString } from "class-validator"
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsNotEmpty()
  roleId: number;
  @IsNotEmpty()
  companyId: number;
  @IsOptional()
  @IsString()
  profilePhoto?: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
