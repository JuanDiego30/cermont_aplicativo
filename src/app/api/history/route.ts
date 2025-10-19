import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/history - Obtener historial de cambios de una orden
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

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

    const orden_id = searchParams.get('orden_id');

    if (!orden_id) {
      return NextResponse.json(
        { error: 'orden_id es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la orden existe
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes_trabajo')
      .select('id')
      .eq('id', orden_id)
      .single();

    if (ordenError || !orden) {
      return NextResponse.json(
        { error: 'Orden de trabajo no encontrada' },
        { status: 404 }
      );
    }

    // Obtener historial con información del usuario
    const { data: historial, error } = await supabase
      .from('historial_ordenes')
      .select(`
        *,
        usuario:usuarios(id, nombre, rol)
      `)
      .eq('orden_id', orden_id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error al obtener historial:', error);
      return NextResponse.json(
        { error: 'Error al obtener historial' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: historial });
  } catch (error) {
    console.error('Error en GET /api/history:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
