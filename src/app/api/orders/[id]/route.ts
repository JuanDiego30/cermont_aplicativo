/**
 * API Route: GET /api/orders/[id]
 * Obtiene detalle de una orden específica
 * 
 * PATCH /api/orders/[id]
 * Actualiza una orden de trabajo
 * 
 * DELETE /api/orders/[id]
 * Elimina una orden de trabajo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, Permission } from '@/lib/types/roles';
import type { ActualizarOrdenInput } from '@/lib/types/database';

/**
 * GET /api/orders/[id]
 * Obtiene detalle completo de una orden
 */
export async function GET(
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

    // Obtener orden con relaciones
    const { id } = await context.params;
    const { data: orden, error } = await supabase
      .from('ordenes_trabajo')
      .select(`
        *,
        cliente:clientes(*),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(*),
        evidencias(*),
        historial:historial_ordenes(
          *,
          usuario:usuarios(id, nombre, email)
        )
      `)
  .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener orden:', error);
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos de acceso
    const canViewAll = hasPermission(usuario.rol, Permission.ORDEN_VIEW_ALL);
    const canViewOwn = hasPermission(usuario.rol, Permission.ORDEN_VIEW_OWN);

    if (!canViewAll && canViewOwn) {
      // Cliente solo ve sus propias órdenes
      if (usuario.rol === 'cliente' && orden.cliente_id !== usuario.id) {
        return NextResponse.json(
          { error: 'Sin acceso a esta orden' },
          { status: 403 }
        );
      }
      // Técnico solo ve órdenes asignadas
      if (usuario.rol === 'tecnico' && orden.tecnico_asignado_id !== usuario.id) {
        return NextResponse.json(
          { error: 'Sin acceso a esta orden' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ data: orden });

  } catch (error) {
    console.error('Error en GET /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Actualiza campos de una orden
 */
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

    // Verificar permisos
    const canUpdateAll = hasPermission(usuario.rol, Permission.ORDEN_UPDATE_ALL);
    const canUpdateOwn = hasPermission(usuario.rol, Permission.ORDEN_UPDATE_OWN);
    
    if (!canUpdateAll && !canUpdateOwn) {
      return NextResponse.json(
        { error: 'Sin permisos para actualizar órdenes' },
        { status: 403 }
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

    // Verificar permisos específicos si solo puede actualizar propias
    if (!canUpdateAll && canUpdateOwn) {
      // Técnico solo puede actualizar órdenes asignadas
      if (usuario.rol === 'tecnico' && ordenActual.tecnico_asignado_id !== usuario.id) {
        return NextResponse.json(
          { error: 'Solo puedes actualizar órdenes asignadas a ti' },
          { status: 403 }
        );
      }
    }

    // Validar body
    const updates: ActualizarOrdenInput = await request.json();

    // Actualizar orden
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(id, tipo, marca, modelo)
      `)
      .single();

    if (error) {
      console.error('Error al actualizar orden:', error);
      return NextResponse.json(
        { error: 'Error al actualizar orden' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error en PATCH /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Elimina una orden de trabajo
 */
export async function DELETE(
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

    // Verificar permisos
    const canDelete = hasPermission(usuario.rol, Permission.ORDEN_DELETE);
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sin permisos para eliminar órdenes' },
        { status: 403 }
      );
    }

    // Verificar que la orden existe
    const { id } = await context.params;
    const { data: orden, error: errorOrden } = await supabase
      .from('ordenes_trabajo')
      .select('id, numero_orden')
      .eq('id', id)
      .single();

    if (errorOrden || !orden) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar orden (cascade eliminará evidencias e historial)
    const { error } = await supabase
      .from('ordenes_trabajo')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar orden:', error);
      return NextResponse.json(
        { error: 'Error al eliminar orden' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: `Orden ${orden.numero_orden} eliminada exitosamente` },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en DELETE /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
