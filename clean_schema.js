const fs = require('fs');
const path = 'apps/api/prisma/schema.prisma';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Punto de corte seguro: Inicio de ComparativaCostos (que está antes de la corrupción sospechada)
    const marker = 'model ComparativaCostos {';
    const index = content.indexOf(marker);

    if (index !== -1) {
        // Cortar todo desde el marcador hasta el final
        const cleanContent = content.substring(0, index);

        // Bloque nuevo limpio (incluyendo ComparativaCostos que cortamos, y lo nuevo)
        const finalBlock = `model ComparativaCostos {
  id              String    @id @default(uuid())
  ordenId         String    @unique
  orden           Order     @relation(fields: [ordenId], references: [id], onDelete: Cascade)
  
  // Estimados (de la propuesta)
  estimadoManoObra      Float   @default(0)
  estimadoMateriales    Float   @default(0)
  estimadoEquipos       Float   @default(0)
  estimadoTransporte    Float   @default(0)
  estimadoOtros         Float   @default(0)
  totalEstimado         Float   @default(0)
  
  // Reales (de la ejecución)
  realManoObra          Float   @default(0)
  realMateriales        Float   @default(0)
  realEquipos           Float   @default(0)
  realTransporte        Float   @default(0)
  realOtros             Float   @default(0)
  totalReal             Float   @default(0)
  
  // Varianza calculada
  varianzaPorcentaje    Float   @default(0)
  margenRealizado       Float   @default(0)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([ordenId])
  @@map("comparativa_costos")
}

// ============================================
// MODELS - FORMULARIOS DINÁMICOS
// ============================================

enum EstadoFormulario {
  borrador
  completado
  archivado
}

model FormTemplate {
  id          String   @id @default(uuid())
  nombre      String   @unique
  tipo        String
  categoria   String
  version     String   @default("1.0")
  schema      Json
  uiSchema    Json?
  descripcion String?
  tags        String[]
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  instancias FormularioInstancia[]

  @@map("form_templates")
}

model FormularioInstancia {
  id              String    @id @default(uuid())
  templateId      String
  template        FormTemplate @relation(fields: [templateId], references: [id])
  ordenId         String?
  orden           Order?    @relation(fields: [ordenId], references: [id])
  data            Json
  completadoPorId String
  completadoPor   User      @relation("FormulariosCompletados", fields: [completadoPorId], references: [id])
  completadoEn    DateTime?
  estado          EstadoFormulario @default(borrador)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([templateId])
  @@index([ordenId])
  @@index([completadoPorId])
  @@map("formulario_instancias")
}
`;
        fs.writeFileSync(path, cleanContent + finalBlock, 'utf8');
        console.log('Schema rewritten successfully');
    } else {
        console.error('Marker ComparativaCostos not found');
        process.exit(1);
    }
} catch (err) {
    console.error('Error fixing file:', err);
    process.exit(1);
}
