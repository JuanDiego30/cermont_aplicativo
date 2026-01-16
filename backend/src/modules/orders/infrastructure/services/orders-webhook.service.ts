import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

type EstadoOrder = string;

export interface OrderstadoChangedWebhookPayload {
  OrderId: string;
  numero: string;
  from: EstadoOrder;
  to: EstadoOrder;
  motivo: string;
  usuarioId?: string;
  timestamp: Date;
  idempotencyKey: string;
}

@Injectable()
export class OrdersWebhookService {
  constructor(private readonly httpService: HttpService) {}

  async sendEstadoChanged(
    payload: OrderstadoChangedWebhookPayload,
  ): Promise<{ url: string; status: number }> {
    const url = process.env.Orders_WEBHOOK_URL?.trim();
    if (!url) {
      return { url: "", status: 204 };
    }

    const response = await firstValueFrom(
      this.httpService.post(
        url,
        {
          event: "Order.estado.changed",
          Order: {
            id: payload.OrderId,
            numero: payload.numero,
          },
          from: payload.from,
          to: payload.to,
          motivo: payload.motivo,
          usuarioId: payload.usuarioId,
          timestamp: payload.timestamp.toISOString(),
        },
        {
          headers: {
            "Idempotency-Key": payload.idempotencyKey,
          },
          timeout: 10_000,
        },
      ),
    );

    return { url, status: response.status };
  }
}
