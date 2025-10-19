import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/types/supabase';

export const dynamic = 'force-dynamic';

// GET /api/clients/[id] - Obtener cliente por ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;
    type ClienteRow = Database['public']['Tables']['clientes']['Row']

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

    // Obtener cliente con sus equipos
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select(`
        *,
        equipos (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener cliente:', error);
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: cliente });
  } catch (error) {
    console.error('Error en GET /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/clients/[id] - Actualizar cliente
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;
    type ClienteUpdate = Database['public']['Tables']['clientes']['Update']

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

    // Obtener usuario actual con tipado explícito
    type UserRole = 'admin' | 'coordinador' | 'gerente' | 'tecnico' | 'cliente' | string;
    const { data: currentUser } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single<{ rol: UserRole }>();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Solo admin, coordinador y gerente pueden actualizar clientes
    if (!['admin', 'coordinador', 'gerente'].includes(currentUser.rol)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para actualizar clientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nombre_empresa,
      nit,
      direccion,
      telefono,
      email,
      contacto_principal,
      activo,
    } = body;

    // Si se actualiza el NIT, verificar que no exista otro cliente con ese NIT
    if (nit) {
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('nit', nit)
        .neq('id', id)
        .single();

      if (existingClient) {
        return NextResponse.json(
          { error: 'Ya existe otro cliente con ese NIT' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: ClienteUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (nombre_empresa) updateData.nombre_empresa = nombre_empresa;
    if (nit) updateData.nit = nit;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (email !== undefined) updateData.email = email;
    if (contacto_principal !== undefined) updateData.contacto_principal = contacto_principal;
    if (activo !== undefined) updateData.activo = activo;

    // Actualizar cliente
    const { data: cliente, error } = await (supabase
      .from('clientes') as any)
      .update(updateData as any)
      .eq('id', id)
  .select()
  .single();

    if (error) {
      console.error('Error al actualizar cliente:', error);
      return NextResponse.json(
        { error: 'Error al actualizar cliente' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: cliente,
      message: 'Cliente actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error en PATCH /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Eliminar cliente
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;
    type ClienteUpdate = Database['public']['Tables']['clientes']['Update']

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

    // Obtener usuario actual con tipado explícito
    type UserRole = 'admin' | 'coordinador' | 'gerente' | 'tecnico' | 'cliente' | string;
    const { data: currentUser } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single<{ rol: UserRole }>();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Solo admin puede eliminar clientes
    if (currentUser.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar clientes' },
        { status: 403 }
      );
    }

    // Verificar si el cliente tiene equipos asociados
    const { data: equipos } = await supabase
      .from('equipos')
      .select('id')
      .eq('cliente_id', id)
      .limit(1);

    if (equipos && equipos.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el cliente porque tiene equipos asociados' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como inactivo
    const { error } = await (supabase
      .from('clientes') as any)
      .update({ activo: false, updated_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar cliente:', error);
      return NextResponse.json(
        { error: 'Error al eliminar cliente' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Cliente desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
