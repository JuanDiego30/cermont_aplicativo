"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { ExternalLink, ClipboardList } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { EmptyStateCard } from "./EmptyStateCard";
import { SectionHeader } from "./SectionHeader";
import type { RecentOrder } from "../model/types";
import { RECENT_ORDER_ESTADO_MAP } from "../model/types";

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  isLoading: boolean;
  viewAllHref?: string;
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
        <div key={idx} className="h-12 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function RecentOrdersTable({ orders, isLoading, viewAllHref }: RecentOrdersTableProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft">
      <SectionHeader
        title="Órdenes Recientes"
        subtitle="Últimas órdenes registradas en el sistema"
        action={
          viewAllHref ? (
            <Link href={viewAllHref} className="text-xs font-medium text-[var(--cermont-blue)] hover:underline">
              Ver todas &rarr;
            </Link>
          ) : undefined
        }
        className="mb-4"
      />
      {isLoading && <TableSkeleton />}
      {!isLoading && orders.length === 0 && (
        <EmptyStateCard
          icon={<ClipboardList className="w-5 h-5" />}
          title="Sin órdenes recientes"
          description="Cuando se creen nuevas órdenes, aparecerán aquí."
          action={
            <Link
              href="/ordenes/nueva"
              className="text-xs font-semibold text-[var(--cermont-blue)] hover:underline"
            >
              + Crear orden
            </Link>
          }
          className="border-none shadow-none py-6"
        />
      )}
      {!isLoading && orders.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--line)]">
                {["Código", "Cliente", "Etapa", "Estado", "Fecha", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider pb-3 px-2 first:pl-0 last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {orders.map((order) => {
                const statusConfig = RECENT_ORDER_ESTADO_MAP[order.estado];
                return (
                  <tr key={order.id} className="hover:bg-[var(--bg-soft)] transition-colors">
                    <td className="py-2.5 px-2 pl-0">
                      <span className="text-xs font-mono font-semibold text-[var(--cermont-blue-light)]">
                        {order.codigo}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-sm text-[var(--text)] truncate max-w-[140px] block">
                        {order.cliente}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-sm text-[var(--text-soft)]">{order.etapa}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      <StatusBadge variant={statusConfig.variant} label={statusConfig.label} />
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {format(new Date(order.fecha), "d MMM", { locale: es })}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 pr-0 text-right">
                      <Link
                        href={`/ordenes/${order.id}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--cermont-blue)] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
