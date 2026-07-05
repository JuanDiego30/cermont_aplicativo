# Contract note — Financial Closure

## SSOT actual

Schemas ServiceEntrySheet, invoice, invoice-approval, payment y closure; reglas de closure/order; módulos SES/invoice/payment/order.

## Secuencia

Acta firmada → SES creada/enviada/aprobada → factura enviada/aprobada → pago conciliado → cierre.

## Invariantes

- Cada entidad pertenece al mismo caso/orden/cliente.
- Cada gate se valida en backend y devuelve razones.
- Rechazo conserva razón e historia.
- Aging se deriva con fecha/zona horaria explícitas.
- Comprobantes usan FileAsset.
- Cierre terminal bloquea mutaciones incompatibles.
- Seguimiento no equivale a emisión DIAN ni integración Ariba.

