// Smoke test de assets criticos del frontend
// Uso: node scripts/smoke-assets.mjs
// Exit: 0 = todos pasan, 1 = alguno falla
// BASE_URL: URL base del servidor (default: http://localhost)

const BASE_URL = process.env.BASE_URL ?? "http://localhost";

const ASSETS = [
	{ path: "/", label: "Root page" },
	{ path: "/manifest.json", label: "Web Manifest" },
	{ path: "/favicon.ico", label: "Favicon" },
	{ path: "/robots.txt", label: "Robots" },
	{ path: "/api/health", label: "API Health" },
	{ path: "/icons/icon-192.png", label: "PWA icon 192" },
	{ path: "/icons/icon-512.png", label: "PWA icon 512" },
	{ path: "/icons/maskable-icon-192.png", label: "Maskable icon 192" },
];

async function checkAsset(asset) {
	const url = `${BASE_URL}${asset.path}`;
	try {
		const resp = await fetch(url, { signal: AbortSignal.timeout(10_000) });
		const ok = resp.status < 400;
		console.log(`${ok ? "PASS" : "FAIL"} [${resp.status}] ${asset.label}: ${url}`);
		return ok;
	} catch (err) {
		console.log(`FAIL [ERR] ${asset.label}: ${url} — ${err.message}`);
		return false;
	}
}

async function main() {
	console.log(`\nSmoke assets — ${BASE_URL}\n`);
	const results = await Promise.all(ASSETS.map(checkAsset));
	const passed = results.filter(Boolean).length;
	const total = results.length;
	console.log(`\n${passed}/${total} assets OK`);
	if (passed < total) {
		console.error("HAY ASSETS FALLIDOS");
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
