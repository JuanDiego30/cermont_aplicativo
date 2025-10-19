import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/users/[id] - Obtener usuario por ID
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

    // Solo admin y coordinador pueden ver otros usuarios
    // Los usuarios pueden ver su propio perfil
    if (
      session.user.id !== id &&
      !['admin', 'coordinador'].includes(currentUser.rol)
    ) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Obtener usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener usuario:', error);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: usuario });
  } catch (error) {
    console.error('Error en GET /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Actualizar usuario
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

    const body = await request.json();
    const { nombre, telefono, empresa, avatar_url, activo, rol } = body;

    // Validar permisos
    if (session.user.id !== id) {
      // Si no es el mismo usuario, necesita ser admin o coordinador
      if (!['admin', 'coordinador'].includes(currentUser.rol)) {
        return NextResponse.json(
          { error: 'No tienes permisos para editar otros usuarios' },
          { status: 403 }
        );
      }

      // Solo admin puede cambiar rol o estado activo
      if ((rol || activo !== undefined) && currentUser.rol !== 'admin') {
        return NextResponse.json(
          { error: 'Solo administradores pueden cambiar rol o estado' },
          { status: 403 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (nombre) updateData.nombre = nombre;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (empresa !== undefined) updateData.empresa = empresa;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (activo !== undefined) updateData.activo = activo;
    if (rol) {
      const rolesValidos = ['admin', 'coordinador', 'tecnico', 'gerente', 'cliente'];
      if (!rolesValidos.includes(rol)) {
        return NextResponse.json(
          { error: `Rol inválido. Debe ser uno de: ${rolesValidos.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.rol = rol;
    }

    // Actualizar usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar usuario:', error);
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: usuario,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error en PATCH /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Eliminar usuario
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

    // Solo admin puede eliminar usuarios
    if (currentUser.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar usuarios' },
        { status: 403 }
      );
    }

    // No permitir auto-eliminación
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    const { error } = await supabase
      .from('usuarios')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar usuario:', error);
      return NextResponse.json(
        { error: 'Error al eliminar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
