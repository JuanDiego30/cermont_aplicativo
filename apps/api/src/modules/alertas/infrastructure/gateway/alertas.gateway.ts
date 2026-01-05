/**
 * @gateway AlertasGateway
 *
 * WebSocket Gateway para notificaciones en tiempo real
 * Usa Socket.io (open source) para comunicación bidireccional
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { OnEvent } from "@nestjs/event-emitter";
import { AlertaEnviadaEvent } from "../../domain/events/alerta-enviada.event";
import { AlertaFallidaEvent } from "../../domain/events/alerta-fallida.event";

@WebSocketGateway({
  cors: {
    origin: "*", // En producción, especificar dominios permitidos
    credentials: true,
  },
  namespace: "/alertas",
})
export class AlertasGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AlertasGateway.name);
  private readonly userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  afterInit(server: Server): void {
    this.logger.log("✅ AlertasGateway inicializado");
  }

  handleConnection(client: Socket): void {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      this.logger.warn(`Cliente ${client.id} conectado sin userId`);
      client.disconnect();
      return;
    }

    // Asociar socket con usuario
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    // Unir a room del usuario
    client.join(`user:${userId}`);

    this.logger.log(`Cliente ${client.id} conectado para usuario ${userId}`);
    this.logger.debug(
      `Total de sockets para usuario ${userId}: ${this.userSockets.get(userId)!.size}`,
    );

    // Enviar confirmación de conexión
    client.emit("connected", {
      message: "Conectado al servicio de alertas",
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket): void {
    // Buscar y remover socket de todos los usuarios
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        this.logger.log(
          `Cliente ${client.id} desconectado de usuario ${userId}`,
        );
        break;
      }
    }
  }

  /**
   * Suscribirse a eventos de alertas
   */
  @SubscribeMessage("subscribe")
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ): void {
    const userId = data.userId;
    client.join(`user:${userId}`);
    this.logger.log(
      `Cliente ${client.id} suscrito a alertas de usuario ${userId}`,
    );

    client.emit("subscribed", {
      userId,
      message: "Suscrito a alertas",
    });
  }

  /**
   * Desuscribirse de eventos de alertas
   */
  @SubscribeMessage("unsubscribe")
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ): void {
    const userId = data.userId;
    client.leave(`user:${userId}`);
    this.logger.log(
      `Cliente ${client.id} desuscrito de alertas de usuario ${userId}`,
    );

    client.emit("unsubscribed", {
      userId,
      message: "Desuscrito de alertas",
    });
  }

  /**
   * Marcar alerta como leída desde el cliente
   */
  @SubscribeMessage("marcar-leida")
  async handleMarcarLeida(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { alertaId: string; userId: string },
  ): Promise<void> {
    // Emitir evento para que el use case lo procese
    this.server.emit("alerta-leida", {
      alertaId: data.alertaId,
      userId: data.userId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Alerta ${data.alertaId} marcada como leída por usuario ${data.userId}`,
    );
  }

  /**
   * Escuchar evento de dominio: AlertaEnviadaEvent
   */
  @OnEvent("ALERTA_ENVIADA")
  handleAlertaEnviada(payload: AlertaEnviadaEvent): void {
    const userId = payload.destinatarioId;

    // Enviar a todos los sockets del usuario
    this.server.to(`user:${userId}`).emit("nueva-alerta", {
      event: "ALERTA_ENVIADA",
      alertaId: payload.aggregateId,
      canal: payload.canal,
      timestamp: payload.timestamp.toISOString(),
    });

    this.logger.debug(
      `Notificación de alerta enviada a usuario ${userId} por WebSocket`,
    );
  }

  /**
   * Escuchar evento de dominio: AlertaFallidaEvent
   */
  @OnEvent("ALERTA_FALLIDA")
  handleAlertaFallida(payload: AlertaFallidaEvent): void {
    const userId = payload.destinatarioId;

    // Notificar al usuario sobre el fallo (opcional)
    this.server.to(`user:${userId}`).emit("alerta-fallida", {
      event: "ALERTA_FALLIDA",
      alertaId: payload.aggregateId,
      error: payload.error,
      intentos: payload.intentos,
      timestamp: payload.timestamp.toISOString(),
    });

    this.logger.debug(
      `Notificación de fallo de alerta enviada a usuario ${userId}`,
    );
  }

  /**
   * Enviar notificación directa a un usuario
   */
  sendNotificationToUser(userId: string, data: any): void {
    this.server.to(`user:${userId}`).emit("nueva-alerta", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Obtener estadísticas de conexiones
   */
  getConnectionStats(): {
    totalConnections: number;
    uniqueUsers: number;
    users: Array<{ userId: string; socketCount: number }>;
  } {
    const users = Array.from(this.userSockets.entries()).map(
      ([userId, sockets]) => ({
        userId,
        socketCount: sockets.size,
      }),
    );

    return {
      totalConnections: Array.from(this.userSockets.values()).reduce(
        (sum, sockets) => sum + sockets.size,
        0,
      ),
      uniqueUsers: this.userSockets.size,
      users,
    };
  }
}
