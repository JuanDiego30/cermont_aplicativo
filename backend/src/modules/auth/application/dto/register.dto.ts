import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from "class-validator";
import { EmailPasswordDto } from "./email-password.dto";

export class RegisterDto extends EmailPasswordDto {

  @ApiProperty({
    description: "Nombre completo del usuario",
    example: "Juan Pérez",
    minLength: 3,
  })
  @IsString({ message: "El nombre debe ser texto" })
  @IsNotEmpty({ message: "El nombre es requerido" })
  @MinLength(3, { message: "El nombre debe tener al menos 3 caracteres" })
  name!: string;

  @ApiPropertyOptional({
    description: "Teléfono de contacto",
    example: "+57 300 123 4567",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description:
      "Rol solicitado (si aplica). Puede ser ignorado por el servidor según permisos.",
    example: "tecnico",
  })
  @IsOptional()
  @IsString()
  role?: string;
}
