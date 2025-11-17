// components/patterns/OrderExecutionCard.tsx
import { Badge } from '@/components/ui/Badge';
import type { Order } from '@/lib/types/order';
import {
  Building2,
  MapPinned,
  CheckSquare,
  Camera,
  MapPin,
  ArrowRight,
} from 'lucide-react';

type OrderExecutionCardProps = {
  order: Order;
  progress?: number;
  onSelect: () => void;
  onChecklist: () => void;
  onPhotos: () => void;
  onGPS: () => void;
};

export function OrderExecutionCard({
  order,
  progress = 0,
  onSelect,
  onChecklist,
  onPhotos,
  onGPS,
}: OrderExecutionCardProps) {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:border-primary-500 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      onClick={onSelect}
    >
      {/* Header */}
      <div className="border-b-2 border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-5 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {order.codigo}
              </h3>
              <Badge state={order.state} />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {order.descripcion || 'Sin descripción'}
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
        </div>
      </div>

      {/* Details */}
      <div className="p-5">
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950">
              <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Cliente
              </p>
              <p className="mt-1 font-bold text-neutral-900 dark:text-neutral-50">
                {order.cliente}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50 dark:bg-secondary-950">
              <MapPinned className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Ubicación
              </p>
              <p className="mt-1 font-bold text-neutral-900 dark:text-neutral-50">
                {order.ubicacion || 'No especificada'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Progreso
            </span>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {progress}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-neutral-200 shadow-inner dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChecklist();
            }}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3 transition-all hover:border-primary-500 hover:bg-primary-50 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-primary-500 dark:hover:bg-primary-950"
          >
            <CheckSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50">
              Checklist
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPhotos();
            }}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3 transition-all hover:border-secondary-500 hover:bg-secondary-50 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-secondary-500 dark:hover:bg-secondary-950"
          >
            <Camera className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50">
              Fotos
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onGPS();
            }}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3 transition-all hover:border-info-500 hover:bg-info-50 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-info-500 dark:hover:bg-info-950"
          >
            <MapPin className="h-5 w-5 text-info-600 dark:text-info-400" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50">
              GPS
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
