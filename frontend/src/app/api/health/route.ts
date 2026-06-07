import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(): NextResponse {
	return NextResponse.json(
		{ ok: true, ts: Date.now() },
		{
			status: 200,
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate",
				"X-Health-Check": "cermont",
			},
		},
	);
}

export function HEAD(): NextResponse {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Cache-Control": "no-store, no-cache, must-revalidate",
			"X-Health-Check": "cermont",
		},
	});
}
