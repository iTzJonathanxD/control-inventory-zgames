import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator"
export class CreateModuleDto {
  @IsNotEmpty()
  @IsString()
  moduleName: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
