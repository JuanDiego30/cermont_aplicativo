import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/clients - Listar clientes con filtros
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
    const activo = searchParams.get('activo');

    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`nombre_empresa.ilike.%${search}%,nit.ilike.%${search}%,contacto_principal.ilike.%${search}%`);
    }

    if (activo !== null && activo !== undefined && activo !== '') {
      query = query.eq('activo', activo === 'true');
    }

    // Ordenar y paginar
    query = query
      .order('nombre_empresa', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: clientes, error, count } = await query;

    if (error) {
      console.error('Error al listar clientes:', error);
      return NextResponse.json(
        { error: 'Error al listar clientes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: clientes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error en GET /api/clients:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Crear nuevo cliente
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

    // Solo admin, coordinador y gerente pueden crear clientes
    if (!['admin', 'coordinador', 'gerente'].includes(currentUser.rol)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para crear clientes' },
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
      activo = true,
    } = body;

    // Validaciones
    if (!nombre_empresa || !nit) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: nombre_empresa, nit' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cliente con ese NIT
    const { data: existingClient } = await supabase
      .from('clientes')
      .select('id')
      .eq('nit', nit)
      .single();

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con ese NIT' },
        { status: 400 }
      );
    }

    // Crear cliente
    const { data: cliente, error } = await supabase
      .from('clientes')
      .insert({
        nombre_empresa,
        nit,
        direccion,
        telefono,
        email,
        contacto_principal,
        activo,
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear cliente:', error);
      return NextResponse.json(
        { error: 'Error al crear cliente' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: cliente, message: 'Cliente creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/clients:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
