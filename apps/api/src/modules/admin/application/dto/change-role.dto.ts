/**
 * @dto ChangeRoleDto
 *
 * DTO para cambio de rol de usuario con ClassValidator.
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty } from "class-validator";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * @deprecated Zod Schema mantenido para compatibilidad.
 */
import { z } from "zod";
export const ChangeRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});
export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>;

/**
 * DTO para cambiar rol con validación ClassValidator.
 */
export class ChangeRoleDto {
  @ApiProperty({
    enum: USER_ROLES,
    example: "supervisor",
    description: "Nuevo rol a asignar",
  })
  @IsNotEmpty({ message: "El rol es requerido" })
  @IsIn(USER_ROLES, { message: `Rol inválido. Roles válidos: ${USER_ROLES.join(", ")}` })
  role!: UserRoleType;
}
