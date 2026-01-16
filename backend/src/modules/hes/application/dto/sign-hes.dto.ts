/**
 * DTO: SignHESDto
 *
 * DTO para firmar una HES
 */

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignHESDto {
  @ApiProperty({ description: 'Firma en base64 (data:image/...)' })
  @IsString()
  @IsNotEmpty()
  imagenBase64!: string;

  @ApiProperty({ description: 'Nombre del firmante' })
  @IsString()
  @IsNotEmpty()
  firmadoPor!: string;

  @ApiProperty({ description: 'Identificación del firmante' })
  @IsString()
  @IsNotEmpty()
  identificacion!: string;
}
