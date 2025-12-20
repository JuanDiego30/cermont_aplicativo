import { NextRequest, NextResponse } from 'next/server';

// Forzar dinámico para evitar caching estático de Next.js
export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{ path: string[] }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    return handleProxy(req, context);
}

export async function GET(req: NextRequest, context: RouteContext) {
    return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
    return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    return handleProxy(req, context);
}

async function handleProxy(req: NextRequest, context: RouteContext) {
    // Next.js 15: params es una Promise
    const { path } = await context.params;
    const pathStr = path.join('/');
    const query = req.nextUrl.search;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const targetUrl = `${backendUrl}/api/${pathStr}${query}`;

    console.log(`[Proxy] ========================================`);
    console.log(`[Proxy] ${req.method} ${targetUrl}`);

    try {
        // Preparar headers - copiar los relevantes
        const headers: Record<string, string> = {
            'Content-Type': req.headers.get('content-type') || 'application/json',
        };

        // Copiar Authorization si existe
        const auth = req.headers.get('authorization');
        if (auth) {
            headers['Authorization'] = auth;
        }

        // Copiar cookies
        const cookies = req.headers.get('cookie');
        if (cookies) {
            headers['Cookie'] = cookies;
        }

        // Preparar body
        let body: string | null = null;

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            try {
                const rawBody = await req.text();
                console.log(`[Proxy] Raw Body received:`, rawBody);

                if (rawBody) {
                    // Validar que es JSON válido
                    const parsed = JSON.parse(rawBody);
                    body = JSON.stringify(parsed);
                    console.log(`[Proxy] Parsed Body:`, body);
                }
            } catch (parseError) {
                console.error(`[Proxy] Error parsing body:`, parseError);
            }
        }

        console.log(`[Proxy] Headers being sent:`, JSON.stringify(headers, null, 2));

        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
            cache: 'no-store',
        });

        console.log(`[Proxy] Backend response status: ${response.status}`);

        // Leer respuesta del backend
        const responseText = await response.text();
        console.log(`[Proxy] Backend response body:`, responseText.substring(0, 500));

        // Construir headers de respuesta
        const resHeaders = new Headers();
        response.headers.forEach((value, key) => {
            // Filtrar headers problemáticos
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                resHeaders.set(key, value);
            }
        });

        return new NextResponse(responseText, {
            status: response.status,
            headers: resHeaders,
        });

    } catch (error) {
        console.error('[Proxy] ❌ Error forwarding request:', error);
        return NextResponse.json(
            { message: 'Error de conexión con el servidor backend', error: String(error) },
            { status: 502 }
        );
    }
}
