/**
 * API Route: PATCH /api/orders/[id]/status
 * Cambia el estado de una orden de trabajo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, Permission } from '@/lib/types/roles';
import type { EstadoOrden } from '@/lib/types/database';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Validar body
    const { estado, notas }: { estado: EstadoOrden; notas?: string } = await request.json();

    if (!estado) {
      return NextResponse.json(
        { error: 'El campo estado es requerido' },
        { status: 400 }
      );
    }

    // Validar estado válido
    const estadosValidos: EstadoOrden[] = [
      'pendiente',
      'asignada',
      'en_progreso',
      'completada',
      'cancelada',
      'aprobada',
    ];

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` },
        { status: 400 }
      );
    }

    // Obtener orden actual
    const { id } = await context.params;
    const { data: ordenActual, error: errorOrden } = await supabase
      .from('ordenes_trabajo')
      .select('*')
      .eq('id', id)
      .single();

    if (errorOrden || !ordenActual) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos según el estado
    let canChange = false;

    // Técnico puede cambiar estado de sus órdenes asignadas
    if (usuario.rol === 'tecnico' && ordenActual.tecnico_asignado_id === usuario.id) {
      canChange = hasPermission(usuario.rol, Permission.ORDEN_UPDATE_OWN);
    }

    // Coordinador y superiores pueden cambiar cualquier estado
    if (hasPermission(usuario.rol, Permission.ORDEN_UPDATE_ALL)) {
      canChange = true;
    }

    // Aprobación de completadas requiere permiso especial
    if (estado === 'completada' && !hasPermission(usuario.rol, Permission.ORDEN_APPROVE)) {
      canChange = false;
    }

    if (!canChange) {
      return NextResponse.json(
        { error: 'Sin permisos para cambiar el estado de esta orden' },
        { status: 403 }
      );
    }

    // Actualizar estado
    const updateData: Record<string, unknown> = {
      estado,
      updated_at: new Date().toISOString(),
    };

    // Si se completa, agregar fecha de finalización
    if (estado === 'completada') {
      updateData.fecha_finalizacion = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(id, tipo, marca, modelo)
      `)
      .single();

    if (error) {
      console.error('Error al actualizar estado:', error);
      return NextResponse.json(
        { error: 'Error al actualizar estado' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: `Estado cambiado a: ${estado}`,
    });

  } catch (error) {
    console.error('Error en PATCH /api/orders/[id]/status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
