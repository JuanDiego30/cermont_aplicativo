// Smoke test de runtime Docker — verifica que los servicios respondan
// Uso: node scripts/smoke-docker-runtime.mjs
// Exit: 0 = todos pasan, 1 = alguno falla
// BASE_URL: URL base del servidor (default: http://localhost)

const BASE_URL = process.env.BASE_URL ?? "http://localhost";

const CHECKS = [
	{
		path: "/api/health",
		label: "Backend health",
		validate: async (resp) => {
			const text = await resp.text();
			return (
				resp.status === 200 &&
				(text.includes("ok") || text.includes("healthy") || text.includes("status"))
			);
		},
	},
	{
		path: "/",
		label: "Frontend root",
		validate: async (resp) => resp.status === 200,
	},
	{
		path: "/manifest.json",
		label: "PWA manifest",
		validate: async (resp) => {
			if (resp.status !== 200) {
				return false;
			}
			try {
				const json = await resp.json();
				return typeof json.name === "string";
			} catch {
				return false;
			}
		},
	},
	{
		path: "/robots.txt",
		label: "Robots.txt",
		validate: async (resp) => resp.status < 400,
	},
];

async function runCheck(check) {
	const url = `${BASE_URL}${check.path}`;
	try {
		const resp = await fetch(url, { signal: AbortSignal.timeout(15_000) });
		const cloned = resp.clone();
		const ok = await check.validate(cloned);
		const icon = ok ? "PASS" : "FAIL";
		console.log(`${icon} [${resp.status}] ${check.label}: ${url}`);
		return ok;
	} catch (err) {
		console.log(`FAIL [ERR] ${check.label}: ${url} — ${err.message}`);
		return false;
	}
}

async function main() {
	console.log(`\nSmoke Docker runtime — ${BASE_URL}\n`);
	const results = [];
	for (const check of CHECKS) {
		results.push(await runCheck(check));
	}
	const passed = results.filter(Boolean).length;
	const total = results.length;
	console.log(`\n${passed}/${total} checks OK`);
	if (passed < total) {
		console.error("HAY CHECKS FALLIDOS — revisar logs con: docker compose logs -f");
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
