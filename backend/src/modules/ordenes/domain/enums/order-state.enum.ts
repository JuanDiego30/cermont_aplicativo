/**
 * @enum OrderState
 * @description Estados principales de una orden (alineado con Prisma OrderStatus)
 * @layer Domain
 */
export enum OrderState {
  PENDIENTE = "pendiente",
  PLANEACION = "planeacion",
  EJECUCION = "ejecucion",
  PAUSADA = "pausada",
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
}
