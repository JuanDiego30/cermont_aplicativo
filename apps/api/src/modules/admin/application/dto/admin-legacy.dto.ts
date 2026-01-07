import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { UserRole } from "../../../../common/enums/user-role.enum";

/**
 * @deprecated Use UserRole from common/enums/user-role.enum
 */
export const UserRoleEnum = UserRole;
export type UserRoleEnum = UserRole;

// ============================================
// CREATE USER
// ============================================
export class CreateUserDto {
  @ApiProperty({ example: "tecnico@cermont.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Tecnico@2025!", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: "Juan Técnico" })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: "tecnico", enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ example: "+573001234567" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsOptional()
  @IsString()
  avatar?: string;
}

// ============================================
// UPDATE USER
// ============================================
export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Juan Técnico Actualizado" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: "+573001234567" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "https://example.com/new-avatar.jpg" })
  @IsOptional()
  @IsString()
  avatar?: string;
}

// ============================================
// UPDATE ROLE
// ============================================
export class UpdateUserRoleDto {
  @ApiProperty({ example: "supervisor", enum: UserRoleEnum })
  @IsEnum(UserRoleEnum)
  role!: UserRoleEnum;
}

// ============================================
// LIST USERS QUERY
// ============================================
export class ListUsersQueryDto {
  @ApiPropertyOptional({ enum: UserRoleEnum })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ["name", "email", "role", "createdAt", "lastLogin"],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  locked?: boolean;
}

// ============================================
// RESPONSES
// ============================================
export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: UserRoleEnum })
  role!: UserRoleEnum;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiPropertyOptional()
  lastLogin?: string;

  @ApiPropertyOptional()
  lockedUntil?: string | null;

  @ApiProperty()
  loginAttempts!: number;

  @ApiProperty()
  createdAt!: string;
}

export class PaginatedUsersResponse {
  @ApiProperty({ type: [UserResponseDto] })
  data!: UserResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  hasMore!: boolean;
}

// ============================================
// ADDITIONAL DTOs REQUIRED BY INDEX
// ============================================

export class AdminChangePasswordDto {
  @ApiProperty({ example: "NewSecure@2025!" })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ToggleUserActiveDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  active!: boolean;
}

export class AdminActionResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: "Operación completada" })
  message!: string;
}

export class ListUsersResponseDto extends PaginatedUsersResponse {}
