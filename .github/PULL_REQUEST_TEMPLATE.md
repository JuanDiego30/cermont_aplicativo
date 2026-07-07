## Resumen

- Que cambia:
- Riesgo principal:
- Impacto esperado:

## Checklist obligatoria

- [ ] Corrí `pnpm lint`
- [ ] Corrí `pnpm typecheck`
- [ ] Corrí pruebas relevantes para el cambio
- [ ] Si toqué Prisma, validé schema/generate y documenté impacto de migración
- [ ] Si toqué auth, revisé login, sesión y rutas protegidas
- [ ] Si toqué handlers mutantes, revisé permisos, validación y errores
- [ ] Si toqué Docker o deploy, verifiqué health check y rollback básico
- [ ] No dejé secretos, archivos `.env`, llaves privadas ni logs en el commit

## Evidencia

- Pruebas ejecutadas:
- Resultado:

## Impacto técnico

- [ ] Prisma / schema
- [ ] Variables de entorno
- [ ] Auth / permisos
- [ ] Docker / CI / deploy
- [ ] PWA / offline
- [ ] Reportes / exportaciones

## Plan de despliegue

- Entorno objetivo:
- Validación post-deploy:
- Paso de rollback si falla:
