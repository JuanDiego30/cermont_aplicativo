import axios from "axios";
import { Injectable } from "@nestjs/common";

type EstadoOrden = string;

export interface OrdenEstadoChangedWebhookPayload {
  ordenId: string;
  numero: string;
  from: EstadoOrden;
  to: EstadoOrden;
  motivo: string;
  usuarioId?: string;
  timestamp: Date;
  idempotencyKey: string;
}

@Injectable()
export class OrdenesWebhookService {
  async sendEstadoChanged(
    payload: OrdenEstadoChangedWebhookPayload,
  ): Promise<{ url: string; status: number }> {
    const url = process.env.ORDENES_WEBHOOK_URL?.trim();
    if (!url) {
      return { url: "", status: 204 };
    }

    const response = await axios.post(
      url,
      {
        event: "orden.estado.changed",
        orden: {
          id: payload.ordenId,
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
    );

    return { url, status: response.status };
  }
}
