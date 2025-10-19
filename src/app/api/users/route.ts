import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/types/supabase';

export const dynamic = 'force-dynamic';

// GET /api/users - Listar usuarios con filtros
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

    // Solo admin y coordinador pueden listar usuarios
    if (!['admin', 'coordinador'].includes(currentUser.rol)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Parámetros de filtrado y paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const rol = searchParams.get('rol') || '';
    const activo = searchParams.get('activo');

    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from('usuarios')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`nombre_completo.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (rol) {
      query = query.eq('rol', rol as 'admin' | 'coordinador' | 'tecnico' | 'gerente' | 'cliente');
    }

    if (activo !== null && activo !== undefined && activo !== '') {
      query = query.eq('activo', activo === 'true');
    }

    // Ordenar y paginar
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: usuarios, error, count } = await query;

    if (error) {
      console.error('Error al listar usuarios:', error);
      return NextResponse.json(
        { error: 'Error al listar usuarios' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: usuarios,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error en GET /api/users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/users - Crear nuevo usuario
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

    // Solo admin puede crear usuarios
    if (currentUser.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear usuarios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      email,
      password,
      nombre,
      rol,
      telefono,
      empresa,
      activo = true,
    } = body;

    // Validaciones
    if (!email || !password || !nombre || !rol) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, password, nombre, rol' },
        { status: 400 }
      );
    }

    // Validar rol
    const rolesValidos = ['admin', 'coordinador', 'tecnico', 'gerente', 'cliente'];
    if (!rolesValidos.includes(rol)) {
      return NextResponse.json(
        { error: `Rol inválido. Debe ser uno de: ${rolesValidos.join(', ')}` },
        { status: 400 }
      );
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        rol,
      },
    });

    if (authError) {
      console.error('Error al crear usuario en Auth:', authError);
      return NextResponse.json(
        { error: `Error al crear usuario: ${authError.message}` },
        { status: 400 }
      );
    }

    // Crear perfil en tabla usuarios
    const { data: usuario, error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email,
        nombre,
        rol: rol as 'admin' | 'coordinador' | 'tecnico' | 'gerente' | 'cliente',
        telefono,
        empresa,
        activo,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error al crear perfil:', profileError);
      // Intentar eliminar usuario de Auth si falla la creación del perfil
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Error al crear perfil de usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: usuario, message: 'Usuario creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
