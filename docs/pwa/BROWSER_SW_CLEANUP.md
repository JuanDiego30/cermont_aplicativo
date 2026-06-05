# Service Worker — Limpieza de Estado del Navegador

> **Cuándo aplicar esta guía:** después de migrar de `@serwist/next` a
> `@serwist/turbopack`, o cuando el navegador tiene un SW viejo cacheado que
> intercepta peticiones y devuelve `503 Service Unavailable` o `404 Not Found`.

---

## 1. Por qué hay que limpiar

Antes de esta migración, el proyecto registraba un Service Worker servido desde
`/service-worker.js` (generado por `@serwist/next`, que solo es compatible con
webpack). Como el dev server usa Turbopack (`next dev --turbopack`), el SW viejo:

- Interceptaba chunks de Turbopack y fallaba al servirlos (`503`).
- Devolvía `404` para assets que el manifest del SW viejo no reconocía.
- Mostraba la advertencia `preload but not used` para `theme-init.js`.

El SW nuevo vive en `/serwist/sw.js` y se compila con esbuild desde
`frontend/src/app/sw.ts` durante `next build`. Una vez que el SW nuevo está
activo, **el navegador puede conservar el SW viejo** hasta que:

- Se desregistre explícitamente, **o**
- Se cierre la última pestaña que controla el scope `/service-worker.js`.

---

## 2. Limpieza manual paso a paso (Chrome / Edge)

1. Abre `http://localhost:3000` (o el dominio de tu entorno).
2. Abre DevTools (`F12` o `Ctrl+Shift+I`).
3. Ve a la pestaña **Application**.
4. En la barra lateral, expande **Service Workers**.
5. Para cada SW listado con scope `/` o `/service-worker.js`:
   - Haz clic en **Unregister**.
6. En la barra lateral, ve a **Storage** (en algunos Chrome está en
   **Application → Storage**).
7. Haz clic en **Clear site data**.
   - Esto limpia: Cache Storage, IndexedDB, localStorage, sessionStorage,
     cookies (excepto HttpOnly en algunos casos), y SW registrations.
8. **Cierra TODAS las pestañas** de `localhost:3000` (o el dominio objetivo).
   - Es importante: mientras haya una pestaña abierta con un SW viejo, el
     scope sigue activo.
9. Abre una pestaña nueva y navega a la app.
10. Verifica en **Application → Service Workers** que solo aparece el nuevo SW
    con scope `/` y script `sw.js` (servido por `/serwist/sw.js`).

> **Atajo de emergencia:** si la app está rota en producción y no puedes
> esperar a un deploy normal, abre una pestaña en modo incógnito
> (`Ctrl+Shift+N`). Las pestañas incógnito no comparten SW registrations con
> pestañas normales.

---

## 3. Script de auto-limpieza (opcional)

Si necesitas limpiar programáticamente (por ejemplo en una herramienta de
soporte interno), expón un endpoint que ejecute la limpieza desde el cliente:

```ts
// frontend/src/lib/pwa/reset-sw.client.ts
"use client";

export async function resetServiceWorkerState(): Promise<void> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return;
	}

	// 1. Pedir al SW activo que limpie sus caches
	const registration = await navigator.serviceWorker.getRegistration();
	if (registration?.active) {
		registration.active.postMessage({ type: "CLEAR_CACHE" });
	}

	// 2. Desregistrar todos los SW del scope
	const registrations = await navigator.serviceWorker.getRegistrations();
	await Promise.all(registrations.map((reg) => reg.unregister()));

	// 3. Limpiar caches del SW (Cache Storage API)
	if ("caches" in window) {
		const keys = await caches.keys();
		await Promise.all(keys.map((key) => caches.delete(key)));
	}

	// 4. Forzar recarga
	window.location.reload();
}
```

Y úsalo desde un botón oculto tras una query string:

```ts
// frontend/src/app/sw-reset/page.tsx (solo dev — opcional)
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("reset") === "sw") {
	void import("@/lib/pwa/reset-sw.client").then((m) => m.resetServiceWorkerState());
}
```

> **No incluyas esto en producción sin pensarlo dos veces.** Es una
> herramienta de soporte, no una feature.

---

## 4. Verificación post-limpieza

Después de limpiar, confirma que el SW nuevo está activo:

1. Abre DevTools → **Application → Service Workers**.
2. Debe haber un único SW con:
   - **Source:** `/serwist/sw.js`
   - **Status:** `activated and is running` (verde)
   - **Scope:** `/`
3. En la consola del navegador:

   ```js
   navigator.serviceWorker.getRegistration().then((r) => console.log(r));
   // Esperado: ServiceWorkerRegistration { active: ServiceWorker { scriptURL: "http://localhost:3000/serwist/sw.js" }, ... }
   ```

4. Carga la app, ve a DevTools → **Network**, marca **Offline** y refresca.
   - Esperado: la app shell se carga desde cache; navegación a rutas
     visitadas funciona; navegación a rutas no visitadas muestra
     `/~offline`.
   - Console: sin errores `404` ni `503` para chunks de Turbopack.

---

## 5. Si la limpieza no funciona

| Síntoma | Causa probable | Solución |
|---|---|---|
| Sigue apareciendo el SW viejo después de Unregister | Otra pestaña abierta con la app | Cierra **todas** las pestañas del dominio |
| `Clear site data` no borra los caches del SW | El SW intercepta la limpieza | Primero unregister, luego clear, luego cerrar pestañas |
| El SW nuevo no se registra | Estás en dev (`NODE_ENV !== "production"`) | El SW se deshabilita en dev. Ejecuta `npm run build -w frontend && npm run start -w frontend` |
| `404` en `/serwist/sw.js` | El build no generó el SW | Verifica que `next build` haya producido `.next/server/app/serwist/sw.js` |
| `503` en chunks Turbopack | Quedó un SW viejo en una pestaña en background | Cierra todas las pestañas, repite pasos 2.1-2.9 |

---

## 6. Política del proyecto

- En **dev** (`npm run dev -w frontend`): SW **deshabilitado** por defecto
  (configurado en `frontend/src/app/serwist-provider.tsx`). Para forzarlo,
  define `NEXT_PUBLIC_ENABLE_SW=true` en `.env.local`.
- En **producción** (`npm run start -w frontend`): SW **habilitado** y
  registrado en el primer load.
- Si modificas `frontend/src/app/sw.ts`, incrementa la `revision` de
  `additionalPrecacheEntries` en `frontend/src/app/serwist/[path]/route.ts`
  para forzar la reinstalación del SW. Ejemplo:

  ```ts
  additionalPrecacheEntries: [
    { url: "/~offline", revision: "offline-route-v2" }, // bump!
  ],
  ```

  El SW compara la `revision` y, si cambia, ejecuta `install` + `activate` y
  purga los caches viejos automáticamente.
