import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// DELETE /api/evidence/[id] - Eliminar evidencia
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

    // Obtener evidencia
    const { data: evidencia, error: evidenciaError } = await supabase
      .from('evidencias')
      .select('*, orden:ordenes_trabajo(id, tecnico_asignado_id)')
      .eq('id', id)
      .single();

    if (evidenciaError || !evidencia) {
      return NextResponse.json(
        { error: 'Evidencia no encontrada' },
        { status: 404 }
      );
    }

    // Validar permisos: solo el técnico asignado, coordinador o admin pueden eliminar
    const canDelete =
      evidencia.orden?.tecnico_asignado_id === session.user.id ||
      ['admin', 'coordinador'].includes(currentUser.rol);

    if (!canDelete) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta evidencia' },
        { status: 403 }
      );
    }

    // Extraer path del archivo de la URL
    const url = new URL(evidencia.url);
    const pathMatch = url.pathname.match(/\/evidencias\/(.+)$/);
    
    if (pathMatch) {
      const filePath = pathMatch[1];
      // Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from('evidencias')
        .remove([`evidencias/${filePath}`]);

      if (storageError) {
        console.error('Error al eliminar archivo de storage:', storageError);
        // Continuar con la eliminación del registro aunque falle el storage
      }
    }

    // Eliminar registro de la base de datos
    const { error: deleteError } = await supabase
      .from('evidencias')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar evidencia:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar evidencia' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Evidencia eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/evidence/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
