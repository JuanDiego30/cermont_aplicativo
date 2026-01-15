/**
 * @dto ChangePasswordDto
 *
 * DTO para cambio de contraseña por admin.
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, Matches } from "class-validator";

/**
 * DTO class para Swagger documentation
 */
export class ChangePasswordDto {
  @ApiProperty({
    example: "NewSecurePass456!",
    description:
      "Nueva contraseña (min 8 chars, mayúsculas, minúsculas y números)",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Contraseña debe contener mayúsculas, minúsculas y números",
  })
  newPassword!: string;
}
