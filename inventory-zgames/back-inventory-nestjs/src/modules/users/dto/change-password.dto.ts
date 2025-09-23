import { IsNotEmpty, IsString, MinLength } from "class-validator"
export class ChangePasswordDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
