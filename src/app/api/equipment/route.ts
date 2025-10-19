import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/equipment - Listar equipos con filtros
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

    // Parámetros de filtrado y paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const cliente_id = searchParams.get('cliente_id') || '';
    const tipo = searchParams.get('tipo') || '';
    const estado = searchParams.get('estado') || '';

    const offset = (page - 1) * limit;

    // Construir query con relación a cliente
    let query = supabase
      .from('equipos')
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit)
      `, { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`marca.ilike.%${search}%,modelo.ilike.%${search}%,numero_serie.ilike.%${search}%`);
    }

    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    // Ordenar y paginar
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: equipos, error, count } = await query;

    if (error) {
      console.error('Error al listar equipos:', error);
      return NextResponse.json(
        { error: 'Error al listar equipos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: equipos,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error en GET /api/equipment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/equipment - Crear nuevo equipo
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

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

    // Solo admin, coordinador y gerente pueden crear equipos
    if (!['admin', 'coordinador', 'gerente'].includes(currentUser.rol)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para crear equipos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      cliente_id,
      tipo,
      marca,
      modelo,
      numero_serie,
      ubicacion,
      fecha_instalacion,
      estado = 'operativo',
      notas,
    } = body;

    // Validaciones
    if (!cliente_id || !tipo || !marca || !modelo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: cliente_id, tipo, marca, modelo' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', cliente_id)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Si tiene número de serie, verificar que sea único
    if (numero_serie) {
      const { data: existingEquipo } = await supabase
        .from('equipos')
        .select('id')
        .eq('numero_serie', numero_serie)
        .single();

      if (existingEquipo) {
        return NextResponse.json(
          { error: 'Ya existe un equipo con ese número de serie' },
          { status: 400 }
        );
      }
    }

    // Crear equipo
    const { data: equipo, error } = await supabase
      .from('equipos')
      .insert({
        cliente_id,
        tipo,
        marca,
        modelo,
        numero_serie,
        ubicacion,
        fecha_instalacion,
        estado,
        notas,
      })
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit)
      `)
      .single();

    if (error) {
      console.error('Error al crear equipo:', error);
      return NextResponse.json(
        { error: 'Error al crear equipo' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: equipo, message: 'Equipo creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/equipment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
