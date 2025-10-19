import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/equipment/[id] - Obtener equipo por ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener equipo con cliente y órdenes relacionadas
    const { data: equipo, error } = await supabase
      .from('equipos')
      .select(`
        *,
        cliente:clientes(*),
        ordenes_trabajo(
          id,
          numero_orden,
          titulo,
          estado,
          prioridad,
          fecha_creacion,
          fecha_programada
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener equipo:', error);
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: equipo });
  } catch (error) {
    console.error('Error en GET /api/equipment/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment/[id] - Actualizar equipo
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener usuario actual
    const { data: currentUser } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Solo admin, coordinador y gerente pueden actualizar equipos
    if (!['admin', 'coordinador', 'gerente'].includes(currentUser.rol)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para actualizar equipos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tipo,
      marca,
      modelo,
      numero_serie,
      ubicacion,
      fecha_instalacion,
      estado,
      notas,
    } = body;

    // Si se actualiza el número de serie, verificar que sea único
    if (numero_serie) {
      const { data: existingEquipo } = await supabase
        .from('equipos')
        .select('id')
        .eq('numero_serie', numero_serie)
        .neq('id', id)
        .single();

      if (existingEquipo) {
        return NextResponse.json(
          { error: 'Ya existe otro equipo con ese número de serie' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (tipo) updateData.tipo = tipo;
    if (marca) updateData.marca = marca;
    if (modelo) updateData.modelo = modelo;
    if (numero_serie !== undefined) updateData.numero_serie = numero_serie;
    if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
    if (fecha_instalacion !== undefined) updateData.fecha_instalacion = fecha_instalacion;
    if (estado) updateData.estado = estado;
    if (notas !== undefined) updateData.notas = notas;

    // Actualizar equipo
    const { data: equipo, error } = await supabase
      .from('equipos')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit)
      `)
      .single();

    if (error) {
      console.error('Error al actualizar equipo:', error);
      return NextResponse.json(
        { error: 'Error al actualizar equipo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: equipo,
      message: 'Equipo actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error en PATCH /api/equipment/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id] - Eliminar equipo
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener usuario actual
    const { data: currentUser } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Solo admin puede eliminar equipos
    if (currentUser.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar equipos' },
        { status: 403 }
      );
    }

    // Verificar si el equipo tiene órdenes asociadas
    const { data: ordenes } = await supabase
      .from('ordenes_trabajo')
      .select('id')
      .eq('equipo_id', id)
      .limit(1);

    if (ordenes && ordenes.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el equipo porque tiene órdenes de trabajo asociadas' },
        { status: 400 }
      );
    }

    // Hard delete del equipo (no tiene órdenes asociadas)
    const { error } = await supabase
      .from('equipos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar equipo:', error);
      return NextResponse.json(
        { error: 'Error al eliminar equipo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Equipo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/equipment/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
