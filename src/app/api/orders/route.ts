/**
 * API Route: GET /api/orders
 * Lista todas las órdenes con filtros y paginación
 * 
 * POST /api/orders
 * Crea una nueva orden de trabajo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, Permission } from '@/lib/types/roles';
import type { CrearOrdenInput, FiltrosOrden, OrdenTrabajo } from '@/lib/types/database';

/**
 * GET /api/orders
 * Obtiene lista de órdenes con filtros opcionales
 */
export async function GET(request: NextRequest) {
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

    // Obtener usuario de la tabla usuarios
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
    const canViewAll = hasPermission(usuario.rol, Permission.ORDEN_VIEW_ALL);
    const canViewOwn = hasPermission(usuario.rol, Permission.ORDEN_VIEW_OWN);

    if (!canViewAll && !canViewOwn) {
      return NextResponse.json(
        { error: 'Sin permisos para ver órdenes' },
        { status: 403 }
      );
    }

    // Extraer parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const estado = searchParams.get('estado');
    const prioridad = searchParams.get('prioridad');
    const clienteId = searchParams.get('cliente_id');
    const tecnicoId = searchParams.get('tecnico_id');
    const search = searchParams.get('search');

    // Construir query base
    let query = supabase
      .from('ordenes_trabajo')
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(id, tipo, marca, modelo)
      `, { count: 'exact' });

    // Aplicar filtros de rol
    if (!canViewAll && canViewOwn) {
      // Cliente solo ve sus órdenes
      if (usuario.rol === 'cliente') {
        query = query.eq('cliente_id', usuario.id);
      }
      // Técnico solo ve órdenes asignadas a él
      else if (usuario.rol === 'tecnico') {
        query = query.eq('tecnico_asignado_id', usuario.id);
      }
    }

    // Aplicar filtros opcionales
    if (estado) {
      query = query.eq('estado', estado as 'pendiente' | 'asignada' | 'en_progreso' | 'completada' | 'cancelada' | 'aprobada');
    }
    if (prioridad) {
      query = query.eq('prioridad', prioridad as 'baja' | 'normal' | 'alta' | 'urgente');
    }
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    if (tecnicoId) {
      query = query.eq('tecnico_asignado_id', tecnicoId);
    }
    if (search) {
      query = query.or(`numero_orden.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    // Ordenar y paginar
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error al obtener órdenes:', error);
      return NextResponse.json(
        { error: 'Error al obtener órdenes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Error en GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Crea una nueva orden de trabajo
 */
export async function POST(request: NextRequest) {
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

    // Obtener usuario
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
    const canCreate = hasPermission(usuario.rol, Permission.ORDEN_CREATE);
    if (!canCreate) {
      return NextResponse.json(
        { error: 'Sin permisos para crear órdenes' },
        { status: 403 }
      );
    }

    // Validar body
    const body: CrearOrdenInput = await request.json();

    const { 
      cliente_id, 
      equipo_id, 
      tipo_orden, 
      descripcion, 
      prioridad,
      fecha_programada 
    } = body;

    if (!cliente_id || !tipo_orden || !descripcion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: cliente_id, tipo_orden, descripcion' },
        { status: 400 }
      );
    }

    // Crear orden
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .insert({
        cliente_id,
        equipo_id,
        tipo_orden,
        descripcion,
        prioridad: prioridad || 'normal',
        estado: 'pendiente',
        fecha_programada,
        creado_por: usuario.id,
      })
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit),
        equipo:equipos(id, tipo, marca, modelo)
      `)
      .single();

    if (error) {
      console.error('Error al crear orden:', error);
      return NextResponse.json(
        { error: 'Error al crear orden' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
