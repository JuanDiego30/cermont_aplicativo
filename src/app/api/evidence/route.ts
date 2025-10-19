import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/evidence - Listar evidencias por orden
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

    // Obtener evidencias
    const { data: evidencias, error } = await supabase
      .from('evidencias')
      .select(`
        *,
        usuario:usuarios(id, nombre)
      `)
      .eq('orden_id', orden_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al listar evidencias:', error);
      return NextResponse.json(
        { error: 'Error al listar evidencias' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: evidencias });
  } catch (error) {
    console.error('Error en GET /api/evidence:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/evidence - Subir nueva evidencia
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orden_id = formData.get('orden_id') as string;
    const tipo = formData.get('tipo') as 'foto' | 'video';
    const descripcion = formData.get('descripcion') as string;

    // Validaciones
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    if (!orden_id) {
      return NextResponse.json(
        { error: 'orden_id es requerido' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = {
      foto: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    };

    const detectedTipo = tipo || (file.type.startsWith('image/') ? 'foto' : 'video');
    const validTypes = allowedTypes[detectedTipo as 'foto' | 'video'];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido. Permitidos: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar tamaño (max 10MB para fotos, 50MB para videos)
    const maxSize = detectedTipo === 'foto' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Archivo demasiado grande. Máximo: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Verificar que la orden existe
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes_trabajo')
      .select('id, numero_orden')
      .eq('id', orden_id)
      .single();

    if (ordenError || !orden) {
      return NextResponse.json(
        { error: 'Orden de trabajo no encontrada' },
        { status: 404 }
      );
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${orden_id}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = `evidencias/${fileName}`;

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('evidencias')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir archivo' },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('evidencias')
      .getPublicUrl(filePath);

    // Crear registro en la tabla evidencias
    const { data: evidencia, error: dbError } = await supabase
      .from('evidencias')
      .insert({
        orden_id,
        tipo: detectedTipo as 'foto' | 'video',
        url: urlData.publicUrl,
        descripcion,
      })
      .select('*')
      .single();

    if (dbError) {
      console.error('Error al crear registro de evidencia:', dbError);
      // Intentar eliminar el archivo subido
      await supabase.storage.from('evidencias').remove([filePath]);
      return NextResponse.json(
        { error: 'Error al guardar evidencia en base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: evidencia, message: 'Evidencia subida exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/evidence:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
