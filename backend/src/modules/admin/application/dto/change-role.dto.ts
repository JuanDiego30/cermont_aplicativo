/**
 * @dto ChangeRoleDto
 *
 * DTO para cambio de rol de usuario.
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * DTO class para Swagger documentation
 */
export class ChangeRoleDto {
  @ApiProperty({
    enum: USER_ROLES,
    example: "supervisor",
    description: "Nuevo rol a asignar",
  })
  @IsEnum(USER_ROLES)
  role!: UserRoleType;
}
