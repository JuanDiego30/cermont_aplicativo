/**
 * Tipos generados de Supabase
 * Este archivo será generado automáticamente cuando conectes con Supabase
 * Por ahora usamos un placeholder con todas las tablas
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string
          rol: 'cliente' | 'tecnico' | 'coordinador' | 'gerente' | 'admin'
          empresa: string | null
          telefono: string | null
          avatar_url: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          rol: 'cliente' | 'tecnico' | 'coordinador' | 'gerente' | 'admin'
          empresa?: string | null
          telefono?: string | null
          avatar_url?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          rol?: 'cliente' | 'tecnico' | 'coordinador' | 'gerente' | 'admin'
          empresa?: string | null
          telefono?: string | null
          avatar_url?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          id: string
          nombre_empresa: string
          nit: string
          direccion: string | null
          telefono: string | null
          email: string | null
          contacto_principal: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_empresa: string
          nit: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          contacto_principal?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_empresa?: string
          nit?: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          contacto_principal?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipos: {
        Row: {
          id: string
          cliente_id: string
          tipo: string
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          ubicacion: string | null
          fecha_instalacion: string | null
          estado: string
          observaciones: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          tipo: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          ubicacion?: string | null
          fecha_instalacion?: string | null
          estado?: string
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          tipo?: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          ubicacion?: string | null
          fecha_instalacion?: string | null
          estado?: string
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipos_cliente_id_fkey"
            columns: ["cliente_id"]
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          }
        ]
      }
      ordenes_trabajo: {
        Row: {
          id: string
          numero_orden: string
          cliente_id: string
          equipo_id: string | null
          tecnico_asignado_id: string | null
          tipo_orden: string
          tipo_equipo: string | null
          titulo: string | null
          descripcion: string
          ubicacion: string | null
          estado: 'pendiente' | 'asignada' | 'en_progreso' | 'completada' | 'cancelada' | 'aprobada'
          prioridad: 'baja' | 'normal' | 'alta' | 'urgente'
          fecha_programada: string | null
          fecha_inicio: string | null
          fecha_finalizacion: string | null
          datos_tecnicos: Json | null
          observaciones: string | null
          recomendaciones: string | null
          creado_por: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_orden?: string
          cliente_id: string
          equipo_id?: string | null
          tecnico_asignado_id?: string | null
          tipo_orden: string
          tipo_equipo?: string | null
          titulo?: string | null
          descripcion: string
          ubicacion?: string | null
          estado?: 'pendiente' | 'asignada' | 'en_progreso' | 'completada' | 'cancelada' | 'aprobada'
          prioridad?: 'baja' | 'normal' | 'alta' | 'urgente'
          fecha_programada?: string | null
          fecha_inicio?: string | null
          fecha_finalizacion?: string | null
          datos_tecnicos?: Json | null
          observaciones?: string | null
          recomendaciones?: string | null
          creado_por: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_orden?: string
          cliente_id?: string
          equipo_id?: string | null
          tecnico_asignado_id?: string | null
          tipo_orden?: string
          tipo_equipo?: string | null
          titulo?: string | null
          descripcion?: string
          ubicacion?: string | null
          estado?: 'pendiente' | 'asignada' | 'en_progreso' | 'completada' | 'cancelada' | 'aprobada'
          prioridad?: 'baja' | 'normal' | 'alta' | 'urgente'
          fecha_programada?: string | null
          fecha_inicio?: string | null
          fecha_finalizacion?: string | null
          datos_tecnicos?: Json | null
          observaciones?: string | null
          recomendaciones?: string | null
          creado_por?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_trabajo_cliente_id_fkey"
            columns: ["cliente_id"]
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_equipo_id_fkey"
            columns: ["equipo_id"]
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_tecnico_asignado_id_fkey"
            columns: ["tecnico_asignado_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_creado_por_fkey"
            columns: ["creado_por"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      evidencias: {
        Row: {
          id: string
          orden_id: string
          tipo: string
          url: string
          descripcion: string | null
          fecha_captura: string
          created_at: string
        }
        Insert: {
          id?: string
          orden_id: string
          tipo: string
          url: string
          descripcion?: string | null
          fecha_captura?: string
          created_at?: string
        }
        Update: {
          id?: string
          orden_id?: string
          tipo?: string
          url?: string
          descripcion?: string | null
          fecha_captura?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidencias_orden_id_fkey"
            columns: ["orden_id"]
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          }
        ]
      }
      historial_ordenes: {
        Row: {
          id: string
          orden_id: string
          usuario_id: string
          accion: string
          detalles: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          orden_id: string
          usuario_id: string
          accion: string
          detalles?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          orden_id?: string
          usuario_id?: string
          accion?: string
          detalles?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_ordenes_orden_id_fkey"
            columns: ["orden_id"]
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_ordenes_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      generar_numero_orden: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      [_: string]: never
    }
    CompositeTypes: {
      [_: string]: never
    }
  }
}
