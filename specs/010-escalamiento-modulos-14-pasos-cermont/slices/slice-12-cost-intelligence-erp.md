# Slice 12 — Cost Intelligence ERP

**Estado:** vertical avanzada presente; validación con datos operativos pendiente.

## Evidencia

Cost, CostControl, CostCatalogItem, contratos/reglas, backend cost, UI cost, alertas y exportación están presentes.

## Aceptación

- Catálogo y líneas reales/estimadas con moneda/unidad.
- Convención única: desviación y signo documentados.
- Consumo 80% y sobrepresupuesto generan riesgo/alerta idempotente.
- Margen bruto se calcula en dominio/backend.
- Rentabilidad por cliente/servicio/periodo evita mezclar datos incompletos.
- Exportación reproduce filtros y totales.

## Tests

Presupuesto cero, moneda, valores negativos inválidos, 79.99/80/100%, doble evento, signo de desviación, margen y CSV.

## Límite

No afirmar ahorro o rentabilidad empresarial sin datos reales y piloto, conforme al LTG.

