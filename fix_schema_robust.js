const fs = require('fs');
const path = 'apps/api/prisma/schema.prisma';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Cleaning Header
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    // Fix known encoding glitches in comments just in case
    content = content.replace(/ÃƒÂ/g, 'A');

    // Find the end of ComparativaCostos
    const marker = 'model ComparativaCostos';
    const markerIndex = content.lastIndexOf(marker);

    if (markerIndex === -1) {
        console.error('CRITICAL: Marker ComparativaCostos not found!');
        // Fallback: try finding 'model AlertaAutomatica'
        const altMarker = 'model AlertaAutomatica';
        const altIndex = content.lastIndexOf(altMarker);
        if (altIndex === -1) {
            console.error('CRITICAL: Backup marker AlertaAutomatica not found either!');
            process.exit(1);
        }
        console.log('Using backup marker AlertaAutomatica');
        // Find the closing brace for AlertaAutomatica
        const closeBrace = content.indexOf('}', altIndex);
        if (closeBrace === -1) process.exit(1);
        content = content.substring(0, closeBrace + 1);

        // We need to re-add ComparativaCostos if we cut it off
        content += `

model ComparativaCostos {
  id              String    @id @default(uuid())
  ordenId         String    @unique
  orden           Order     @relation(fields: [ordenId], references: [id], onDelete: Cascade)
  estimadoManoObra      Float   @default(0)
  estimadoMateriales    Float   @default(0)
  estimadoEquipos       Float   @default(0)
  estimadoTransporte    Float   @default(0)
  estimadoOtros         Float   @default(0)
  totalEstimado         Float   @default(0)
  realManoObra          Float   @default(0)
  realMateriales        Float   @default(0)
  realEquipos           Float   @default(0)
  realTransporte        Float   @default(0)
  realOtros             Float   @default(0)
  totalReal             Float   @default(0)
  varianzaPorcentaje    Float   @default(0)
  margenRealizado       Float   @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  @@index([ordenId])
  @@map("comparativa_costos")
}`;

    } else {
        console.log('Found ComparativaCostos marker.');
        // Find closing brace
        const closeBrace = content.indexOf('}', markerIndex);
        if (closeBrace === -1) {
            console.error('Could not find closing brace for ComparativaCostos');
            process.exit(1);
        }
        content = content.substring(0, closeBrace + 1);
    }

    // Append the missing models Cleanly
    const newModels = `

// ============================================
// MODELS - FORMULARIOS DINAMICOS
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

    fs.writeFileSync(path, content + newModels, 'utf8');
    console.log('Successfully rewrote schema end.');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
