import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Length, Matches } from 'class-validator';
import { EmailPasswordDto } from './email-password.dto';

export class LoginDto extends EmailPasswordDto {
  @ApiPropertyOptional({
    description: 'Mantener sesión activa (recordarme)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @ApiPropertyOptional({
    description: 'Código 2FA (obligatorio para admin)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'El código 2FA debe tener 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El código 2FA debe contener solo dígitos numéricos' })
  twoFactorCode?: string;
}
