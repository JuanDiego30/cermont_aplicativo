/**
 * @file env.validation.ts
 * @description Validación estricta de variables de entorno usando class-validator.
 *
 * Uso: Usar como validationSchema en ConfigModule.forRoot().
 * Si las variables son inválidas, la aplicación termina con error.
 */
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN = '7d';

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsUrl()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsEmail()
  @IsOptional()
  SMTP_FROM?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = errors
      .map(err => {
        const constraints = err.constraints
          ? Object.values(err.constraints).join(', ')
          : 'Validation failed';
        return `  - ${err.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(`❌ Invalid environment variables:\n${formattedErrors}`);
  }

  return validatedConfig;
}

// Export type for compatibility
export type Env = EnvironmentVariables;
