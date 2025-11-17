// app/field/execution/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import { useState, useEffect } from 'react';
import { useOrders } from '@/lib/hooks/useOrders';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { OrderState } from '@/lib/types/order';

// Components
import { PhotoCapture } from '@/components/field/PhotoCapture';
import { GPSCapture } from '@/components/field/GPSCapture';
import { ChecklistExecutor } from '@/components/checklists/ChecklistExecutor';

// Universal Components
import { AnimatedBackground } from '@/components/patterns/AnimatedBackground';
import { LoadingState } from '@/components/patterns/LoadingState';
import { EmptyState } from '@/components/patterns/EmptyState';
import { OrderExecutionCard } from '@/components/patterns/OrderExecutionCard';

// Icons
import {
  FileText,
  Camera,
  MapPin,
  CheckSquare,
  Activity,
  Wifi,
  WifiOff,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================
const NAV_ITEMS = [
  { id: 'orders' as const, label: 'Órdenes', icon: FileText },
  { id: 'checklist' as const, label: 'Checklist', icon: CheckSquare },
  { id: 'photos' as const, label: 'Fotos', icon: Camera },
  { id: 'gps' as const, label: 'GPS', icon: MapPin },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function FieldExecutionPage() {
  // ------------------------------------
  // Hooks & State
  // ------------------------------------
  const { isOffline } = useOnlineStatus();
  const { orders = [], isLoading } = useOrders({
    estado: OrderState.EJECUCION,
  });

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'orders' | 'checklist' | 'photos' | 'gps'>('orders');

  // ------------------------------------
  // Effects
  // ------------------------------------
  useEffect(() => {
    if (orders.length === 1) {
      setSelectedOrder(orders[0].id);
    }
  }, [orders]);

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    setActiveView('checklist');
  };

  const handleNavigation = (view: typeof activeView) => {
    if (view !== 'orders' && !selectedOrder) return;
    setActiveView(view);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // ------------------------------------
  // Loading State
  // ------------------------------------
  if (isLoading) {
    return (
      <AnimatedBackground className="flex items-center justify-center">
        <LoadingState message="Cargando órdenes..." subMessage="Sincronizando datos" />
      </AnimatedBackground>
    );
  }

  // ------------------------------------
  // Main Layout
  // ------------------------------------
  return (
    <AnimatedBackground>
      {/* ========================================
          SECTION: Sticky Header
      ========================================== */}
      <header className="sticky top-0 z-40 border-b-2 border-neutral-200 bg-white/95 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950">
                  <Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Ejecución en Campo
                </span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Órdenes Activas
              </h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {orders.length} {orders.length === 1 ? 'orden en progreso' : 'órdenes en progreso'}
              </p>
            </div>

            {/* Online/Offline Status Badge */}
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2 shadow-lg transition-all ${
                isOffline
                  ? 'border-2 border-warning-200 bg-gradient-to-br from-warning-50 to-warning-100 dark:border-warning-900 dark:from-warning-950 dark:to-warning-900'
                  : 'border-2 border-success-200 bg-gradient-to-br from-success-50 to-success-100 dark:border-success-900 dark:from-success-950 dark:to-success-900'
              }`}
            >
              {isOffline ? (
                <WifiOff className="h-5 w-5 text-warning-700 dark:text-warning-400" />
              ) : (
                <Wifi className="h-5 w-5 text-success-700 dark:text-success-400" />
              )}
              <span
                className={`text-sm font-bold ${
                  isOffline
                    ? 'text-warning-800 dark:text-warning-300'
                    : 'text-success-800 dark:text-success-300'
                }`}
              >
                {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================
          SECTION: Content Views
      ========================================== */}
      <div className="pb-24">
        {/* Orders List View */}
        {activeView === 'orders' && (
          <div className="space-y-4 p-6">
            {orders.length === 0 ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                  icon={FileText}
                  title="No hay órdenes en ejecución"
                  description="Las órdenes asignadas aparecerán aquí cuando entren en ejecución"
                />
              </div>
            ) : (
              orders.map((order, i) => (
                <div
                  key={order.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <OrderExecutionCard
                    order={order}
                    progress={0}
                    onSelect={() => handleOrderSelect(order.id)}
                    onChecklist={() => {
                      setSelectedOrder(order.id);
                      setActiveView('checklist');
                    }}
                    onPhotos={() => {
                      setSelectedOrder(order.id);
                      setActiveView('photos');
                    }}
                    onGPS={() => {
                      setSelectedOrder(order.id);
                      setActiveView('gps');
                    }}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Checklist View */}
        {activeView === 'checklist' && selectedOrder && (
          <ChecklistExecutor
            checklistId={selectedOrder}
            isOpen={true}
            onClose={() => setActiveView('orders')}
          />
        )}

        {/* Photos View */}
        {activeView === 'photos' && selectedOrder && (
          <PhotoCapture orderId={selectedOrder} onBack={() => setActiveView('orders')} />
        )}

        {/* GPS View */}
        {activeView === 'gps' && selectedOrder && (
          <GPSCapture orderId={selectedOrder} onBack={() => setActiveView('orders')} />
        )}
      </div>

      {/* ========================================
          SECTION: Bottom Navigation Bar
      ========================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-neutral-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="grid grid-cols-4 gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            const isDisabled = item.id !== 'orders' && !selectedOrder;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                disabled={isDisabled}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg'
                    : 'hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-800'
                }`}
              >
                <item.icon
                  className={`h-6 w-6 ${
                    isActive ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    isActive ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </AnimatedBackground>
  );
}




