# Protocolo de prueba offline/online

Este protocolo evita validar un Service Worker antiguo o una caché residual del
navegador durante las pruebas del aplicativo CERMONT.

## 1. Limpieza antes de probar

1. Abrir la aplicación en el navegador.
2. Abrir DevTools.
3. Ir a Application -> Service Workers.
4. Ejecutar Unregister sobre cualquier Service Worker existente del sitio.
5. Ir a Application -> Storage.
6. Activar las opciones de almacenamiento del sitio y ejecutar Clear site data.
7. Cerrar la pestaña.
8. Abrir una pestaña nueva en `http://localhost:3000`.

## 2. Prueba de App Shell

1. Ejecutar `npm run build`.
2. Ejecutar `npm run start`.
3. Abrir `http://localhost:3000`. Si el puerto está ocupado, ejecutar el
   frontend con un puerto alterno, por ejemplo
   `npm -w @cermont/frontend run start -- -p 3010`, y usar esa URL durante
   toda la prueba.
4. Navegar online por rutas principales ya cargadas, como dashboard, órdenes,
   casos de servicio y planeación.
5. Confirmar en Application -> Service Workers que `/service-worker.js` está
   activo y con scope `/`.
6. Confirmar en Application -> Cache Storage que existen recursos
   `/_next/static/chunks`, `/_next/static/css`, `/manifest.json`, `/~offline`
   u `/offline.html`.
7. Cambiar DevTools -> Network a Offline.
8. Recargar la página.
9. Verificar que la aplicación no queda en blanco, conserva estilos, muestra
   banner offline o fallback y no genera ciclos repetidos sobre `/api/backend/*`.

## 3. Prueba de backend no disponible

1. Mantener el frontend en modo producción.
2. Apagar o no iniciar el backend.
3. Cargar una vista que consulte `/api/backend/*`.
4. Confirmar que la respuesta del proxy frontend es `503 BACKEND_UNAVAILABLE`.
5. Confirmar que la UI muestra estado controlado y no un error 500 genérico.

## 4. Prueba de IndexedDB y cola local

1. Iniciar sesión online.
2. Abrir un módulo con soporte offline, como planeación, ejecución o evidencias.
3. Cambiar DevTools -> Network a Offline.
4. Crear un borrador o dejar una evidencia pendiente.
5. Revisar Application -> IndexedDB -> `CermontOfflineDB`.
6. Confirmar registros en `offlineDrafts`, `offlineOutbox`, `offlineFiles` o
   `offlineSyncLogs`, según el flujo probado.
7. Volver a Online y ejecutar sincronización desde el chip o banner.
8. Confirmar que el registro cambia de pendiente a sincronizado o fallido con
   error visible.
