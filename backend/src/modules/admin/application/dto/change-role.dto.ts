/**
 * @dto ChangeRoleDto
 *
 * DTO para cambio de rol de usuario.
 */

import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * Schema Zod para validación
 */
export const ChangeRoleSchema = z.object({
  role: z.enum(USER_ROLES, {
    message: `Rol inválido. Roles válidos: ${USER_ROLES.join(", ")}`,
  }),
});

export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>;

/**
 * DTO class para Swagger documentation
 */
export class ChangeRoleDto implements ChangeRoleInput {
  @ApiProperty({
    enum: USER_ROLES,
    example: "supervisor",
    description: "Nuevo rol a asignar",
  })
  role!: UserRoleType;
}
