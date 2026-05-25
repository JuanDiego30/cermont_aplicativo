/**
 * SERVICE WORKER — CERMONT PWA v2
 * Estrategia de caché:
 * - STATIC_CACHE: Assets estáticos (CSS, JS, imágenes) — Cache-first
 * - DYNAMIC_CACHE: Páginas y datos dinámicos — Network-first con fallback
 * - API_GET_CACHE: Respuestas GET de API — Network-first con caché para offline
 * - API mutations (POST/PUT/PATCH/DELETE): Network-only (se encola offline-queue)
 *
 * La app debe funcionar con normalidad cuando se pierde internet,
 * sirviendo datos cacheados y mostrando estado de sincronización pendiente.
 */

const STATIC_CACHE = "cermont-static-v2";
const DYNAMIC_CACHE = "cermont-dynamic-v2";
const API_CACHE = "cermont-api-v2";

const STATIC_ASSETS = ["/", "/dashboard", "/manifest.json", "/offline.html"];

const API_CACHE_LIMIT = 200;

/**
 * Install: Cachear assets estáticos
 */
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE).then((cache) => {
			return cache.addAll(STATIC_ASSETS).catch((err) => {
				console.warn("[SW] Error cacheando assets estáticos:", err);
			});
		}),
	);
	self.skipWaiting();
});

/**
 * Activate: Limpiar cachés viejos
 */
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => !name.startsWith("cermont-"))
					.map((name) => caches.delete(name)),
			);
		}),
	);
	self.clients.claim();
});

/**
 * Limitar tamaño del caché de API
 */
async function trimAPICache(cache) {
	const requests = await cache.keys();
	if (requests.length > API_CACHE_LIMIT) {
		// Eliminar los más antiguos (los primeros de la lista)
		const toDelete = requests.slice(0, requests.length - API_CACHE_LIMIT);
		await Promise.all(toDelete.map((req) => cache.delete(req)));
	}
}

/**
 * Determina si una URL de API debe cachearse para offline
 */
function isCacheableAPI(url) {
	// Solo cachear GET a /api/backend/* (datos de negocio)
	if (!url.pathname.startsWith("/api/backend/")) return false;

	// NO cachear endpoints que devuelven datos sensibles o sesión
	const skipPatterns = [
		"/api/backend/auth/",
		"/api/backend/users/me",
		"/api/backend/sync/",
		"/api/backend/uploads/",
	];
	for (const pattern of skipPatterns) {
		if (url.pathname.startsWith(pattern)) return false;
	}

	return true;
}

/**
 * Fetch: Estrategia de caché según el tipo de request
 */
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Solo cachear GET requests
	if (request.method !== "GET") {
		return;
	}

	// 1. STATIC ASSETS (JS, CSS, imágenes) — Cache-first
	if (
		url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/) ||
		url.pathname.startsWith("/api/uploads")
	) {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) {
					return cached;
				}
				return fetch(request).then((response) => {
					if (response && response.status === 200) {
						const responseToCache = response.clone();
						event.waitUntil(
							caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseToCache)),
						);
					}
					return response;
				});
			}),
		);
		return;
	}

	// 2. API CALLS (/api/*) — Network-first con fallback a caché
	if (url.pathname.startsWith("/api/")) {
		// Solo cachear GET
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Cachear respuestas exitosas de GET para uso offline
					if (response && response.status === 200 && isCacheableAPI(url)) {
						const responseToCache = response.clone();
						event.waitUntil(
							caches.open(API_CACHE).then((cache) => {
								cache.put(request, responseToCache);
								trimAPICache(cache);
							}),
						);
					}
					return response;
				})
				.catch(async () => {
					// Offline: buscar en caché
					const cached = await caches.match(request);
					if (cached) {
						// Devolver con header offline para que la UI sepa
						const headers = new Headers(cached.headers);
						headers.set("X-Offline-Mode", "true");
						return new Response(cached.body, {
							status: cached.status,
							statusText: cached.statusText,
							headers,
						});
					}
					// No hay caché: responder error offline
					return new Response(
						JSON.stringify({
							success: false,
							error: {
								code: "OFFLINE",
								message:
									"Sin conexión a internet. Los datos mostrados pueden estar desactualizados. Las acciones pendientes se sincronizarán al recuperar conexión.",
							},
							_offline: true,
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json", "X-Offline-Mode": "true" },
						},
					);
				}),
		);
		return;
	}

	// 3. PÁGINAS HTML — Network-first con fallback a offline
	if (request.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith(".html")) {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (response && response.status === 200) {
						const responseToCache = response.clone();
						event.waitUntil(
							caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseToCache)),
						);
					}
					return response;
				})
				.catch(() => {
					return caches
						.match(request)
						.then((cached) => cached || caches.match("/offline.html"))
						.catch(() => new Response("Offline", { status: 503 }));
				}),
		);
		return;
	}

	// 4. DEFAULT — Network-first
	event.respondWith(
		fetch(request)
			.then((response) => {
				if (response && response.status === 200) {
					const responseToCache = response.clone();
					event.waitUntil(
						caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseToCache)),
					);
				}
				return response;
			})
			.catch(() => caches.match(request)),
	);
});

/**
 * Message handling para sincronización manual y control de caché
 */
self.addEventListener("message", (event) => {
	if (event.data?.type === "SKIP_WAITING") {
		self.skipWaiting();
		event.ports?.[0]?.postMessage({ success: true });
	}

	if (event.data?.type === "CLEAR_CACHE") {
		event.waitUntil(
			Promise.all([
				caches.delete(DYNAMIC_CACHE),
				caches.delete(STATIC_CACHE),
				caches.delete(API_CACHE),
			]).then(() => {
				event.ports?.[0]?.postMessage({ success: true });
			}),
		);
	}

	// Cachear una respuesta de API específica para uso offline inmediato
	if (event.data?.type === "CACHE_API_RESPONSE" && event.data?.url && event.data?.response) {
		event.waitUntil(
			caches.open(API_CACHE).then((cache) => {
				const request = new Request(event.data.url);
				const response = new Response(JSON.stringify(event.data.response), {
					headers: { "Content-Type": "application/json" },
				});
				cache.put(request, response);
				event.ports?.[0]?.postMessage({ success: true });
			}),
		);
	}
});
