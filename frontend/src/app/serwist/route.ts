import { createSerwistRoute } from "@serwist/turbopack";
import { type NextRequest, NextResponse } from "next/server";

const serwistRoute = createSerwistRoute({
  swSrc: "src/app/sw.ts",
});

const { GET: serwistGET } = serwistRoute;

// Only serve the service worker in production — dev mode should use the raw Next.js assets
export async function GET(request: NextRequest, context: { params: Promise<{ path: string }> }): Promise<NextResponse> {
  if (process.env.NODE_ENV !== "production") {
    return new NextResponse(null, { status: 404 });
  }
  return serwistGET(request, context);
}

export const dynamic = "force-dynamic";