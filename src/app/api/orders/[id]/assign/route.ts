/**
 * API Route: POST /api/orders/[id]/assign
 * Asigna un técnico a una orden de trabajo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, Permission } from '@/lib/types/roles';
import type { AsignarOrdenInput } from '@/lib/types/database';

export async function POST(
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
    const canAssign = hasPermission(usuario.rol, Permission.ORDEN_ASSIGN);
    if (!canAssign) {
      return NextResponse.json(
        { error: 'Sin permisos para asignar órdenes' },
        { status: 403 }
      );
    }

    // Validar body
    const { tecnico_id, fecha_programada, notas }: AsignarOrdenInput = await request.json();

    if (!tecnico_id) {
      return NextResponse.json(
        { error: 'El campo tecnico_id es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el técnico existe y es técnico
    const { data: tecnico, error: errorTecnico } = await supabase
      .from('usuarios')
      .select('id, nombre, rol')
      .eq('id', tecnico_id)
      .single();

    if (errorTecnico || !tecnico) {
      return NextResponse.json(
        { error: 'Técnico no encontrado' },
        { status: 404 }
      );
    }

    if (tecnico.rol !== 'tecnico') {
      return NextResponse.json(
        { error: 'El usuario seleccionado no es un técnico' },
        { status: 400 }
      );
    }

    // Actualizar orden
    const updateData: Record<string, unknown> = {
      tecnico_asignado_id: tecnico_id,
      estado: 'asignada',
      updated_at: new Date().toISOString(),
    };

    if (fecha_programada) {
      updateData.fecha_programada = fecha_programada;
    }

    const { id } = await context.params;
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
      console.error('Error al asignar técnico:', error);
      return NextResponse.json(
        { error: 'Error al asignar técnico' },
        { status: 500 }
      );
    }

    // Registrar en historial (trigger automático lo hace)

    return NextResponse.json({
      data,
      message: `Orden asignada a ${tecnico.nombre}`,
    });

  } catch (error) {
    console.error('Error en POST /api/orders/[id]/assign:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
