/**
 * @barrel Domain Events
 * 
 * Exportación centralizada de eventos del dominio.
 */

export * from './user-created.event';
export * from './user-updated.event';
export * from './role-changed.event';
export * from './user-deactivated.event';
export * from './password-reset.event';

/**
 * Tipo unión de todos los eventos de dominio de usuario
 */
import { UserCreatedEvent } from './user-created.event';
import { UserUpdatedEvent } from './user-updated.event';
import { RoleChangedEvent } from './role-changed.event';
import { UserDeactivatedEvent } from './user-deactivated.event';
import { PasswordResetEvent } from './password-reset.event';

export type UserDomainEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | RoleChangedEvent
  | UserDeactivatedEvent
  | PasswordResetEvent;
