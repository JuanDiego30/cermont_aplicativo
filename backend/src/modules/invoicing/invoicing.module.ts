/**
 * @module InvoicingModule
 * @description Módulo de control de facturación SES Ariba
 *
 * Flujo:
 * 1. Orden completada + Acta firmada → Habilitar "Generar SES"
 * 2. SES generado en Ariba → Registrar número SES
 * 3. SES aprobado → Generar factura
 * 4. Factura aprobada en Ariba → Actualizar estado
 * 5. Pago recibido → Cerrar ciclo
 *
 * Alertas automáticas:
 * - SES no generado >3 días después de acta firmada
 * - SES no aprobado >7 días después de envío
 * - Factura no generada >2 días después de SES aprobado
 * - Pago no recibido >30 días después de factura aprobada
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FacturacionController } from './facturacion.controller';
import { FacturacionService } from './facturacion.service';

@Module({
  imports: [PrismaModule],
  controllers: [FacturacionController],
  providers: [FacturacionService],
  exports: [FacturacionService],
})
export class InvoicingModule {}
