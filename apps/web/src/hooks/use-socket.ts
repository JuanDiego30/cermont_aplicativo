// ============================================
// useSocket Hook - Cermont FSM
// ============================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

// Singleton socket instance
let socketInstance: Socket | null = null;

interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export function useSocket() {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    // Reutilizar instancia existente
    if (!socketInstance) {
      setState((prev) => ({ ...prev, connecting: true }));

      socketInstance = io(
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
        {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
          timeout: 20000,
        }
      );

      socketInstance.on('connect', () => {
        console.log('✅ Socket connected:', socketInstance?.id);
        setState({ connected: true, connecting: false, error: null });
      });

      socketInstance.on('disconnect', (reason: string) => {
        console.log('❌ Socket disconnected:', reason);
        setState((prev) => ({ ...prev, connected: false }));
      });

      socketInstance.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error.message);
        setState({
          connected: false,
          connecting: false,
          error: error.message,
        });
      });

      socketInstance.on('reconnect', (attemptNumber: number) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setState({ connected: true, connecting: false, error: null });
      });

      socketInstance.on('reconnect_attempt', (attemptNumber: number) => {
        console.log('🔄 Socket reconnecting... attempt', attemptNumber);
        setState((prev) => ({ ...prev, connecting: true }));
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setState({
          connected: false,
          connecting: false,
          error: 'Reconnection failed',
        });
      });
    }

    socketRef.current = socketInstance;

    // Actualizar estado inicial
    if (socketInstance.connected) {
      setState({ connected: true, connecting: false, error: null });
    }

    return () => {
      // No desconectar al desmontar - mantener conexión activa
    };
  }, [token, user]);

  // Suscribirse a eventos
  const subscribe = useCallback(
    <T = any>(event: string, callback: (data: T) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    },
    []
  );

  // Emitir eventos
  const emit = useCallback(
    <T = any>(event: string, data?: T) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
        return true;
      }
      console.warn('Socket not connected, cannot emit:', event);
      return false;
    },
    []
  );

  // Unirse a sala
  const joinRoom = useCallback(
    (roomType: string, roomId: string) => {
      emit(`${roomType}:subscribe`, roomId);
    },
    [emit]
  );

  // Salir de sala
  const leaveRoom = useCallback(
    (roomType: string, roomId: string) => {
      emit(`${roomType}:unsubscribe`, roomId);
    },
    [emit]
  );

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    if (socketInstance && !socketInstance.connected) {
      socketInstance.connect();
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      socketRef.current = null;
      setState({ connected: false, connecting: false, error: null });
    }
  }, []);

  return {
    socket: socketRef.current,
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    subscribe,
    emit,
    joinRoom,
    leaveRoom,
    reconnect,
    disconnect,
  };
}

// ============================================
// useSocketRoom - Hook para salas específicas
// ============================================

export function useSocketRoom(roomType: string, roomId: string | null) {
  const { subscribe, joinRoom, leaveRoom, connected } = useSocket();

  useEffect(() => {
    if (!roomId || !connected) return;

    joinRoom(roomType, roomId);

    return () => {
      leaveRoom(roomType, roomId);
    };
  }, [roomId, roomType, connected, joinRoom, leaveRoom]);

  return { subscribe, connected };
}

// ============================================
// useOrdenSocket - Hook para órdenes
// ============================================

export function useOrdenSocket(ordenId: string | null) {
  const { subscribe, connected } = useSocketRoom('orden', ordenId);
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!ordenId || !connected) return;

    const unsubUpdated = subscribe('orden:updated', (data: any) => {
      setUpdates((prev) => [...prev, { type: 'updated', ...data }]);
    });

    const unsubEstado = subscribe('orden:estado', (data: any) => {
      setUpdates((prev) => [...prev, { type: 'estado', ...data }]);
    });

    const unsubEvidencia = subscribe('evidencia:new', (data: any) => {
      setUpdates((prev) => [...prev, { type: 'evidencia', ...data }]);
    });

    return () => {
      unsubUpdated();
      unsubEstado();
      unsubEvidencia();
    };
  }, [ordenId, connected, subscribe]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return { updates, clearUpdates, connected };
}

// ============================================
// useEjecucionSocket - Hook para ejecución
// ============================================

export function useEjecucionSocket(ejecucionId: string | null) {
  const { subscribe, connected } = useSocketRoom('ejecucion', ejecucionId);
  const [progress, setProgress] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!ejecucionId || !connected) return;

    const unsubProgress = subscribe('ejecucion:progress', (data: any) => {
      setProgress(data.progress || data.avance || 0);
      setLastUpdate(new Date(data.timestamp));
      setIsLive(true);

      // Desactivar indicador "live" después de 5 segundos
      setTimeout(() => setIsLive(false), 5000);
    });

    const unsubUpdate = subscribe('ejecucion:update', (data: any) => {
      setProgress(data.avance || 0);
      setLastUpdate(new Date(data.timestamp));
      setIsLive(true);
      setTimeout(() => setIsLive(false), 5000);
    });

    return () => {
      unsubProgress();
      unsubUpdate();
    };
  }, [ejecucionId, connected, subscribe]);

  return { progress, lastUpdate, isLive, connected };
}

export default useSocket;
