
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const forms = [
    {
        id: 'ast',
        nombre: 'Análisis de Trabajo Seguro (ATS)',
        codigo: 'FT-HES-126',
        descripcion: 'Procedimiento para identificar peligros y riesgos antes de cada trabajo',
        version: 2,
        schema: JSON.stringify({
            categoria: 'seguridad',
            requiresSignatures: { tecnico: true, supervisor: true },
            fields: [
                { id: 'lugar', type: 'text', label: 'Lugar/Facilidad', required: true, order: 1 },
                { id: 'fecha', type: 'date', label: 'Fecha', required: true, order: 2 },
                { id: 'hora_inicio', type: 'time', label: 'Hora de Inicio', required: true, order: 3 },
                { id: 'trabajo_realizar', type: 'textarea', label: 'Trabajo a Realizar', required: true, order: 4 },
                { id: 'epp_requerido', type: 'checkbox', label: 'EPP Requerido', required: true, options: [{ value: 'casco' }, { value: 'gafas' }, { value: 'guantes' }], order: 5 },
                // Simplified for seeding speed, full JSON logic handled in frontend for now or sync later
            ]
        })
    },
    {
        id: 'permiso_caliente',
        nombre: 'Permiso de Trabajo en Caliente',
        codigo: 'FT-HES-201',
        descripcion: 'Autorización para trabajos con llama abierta',
        version: 1,
        schema: JSON.stringify({ categoria: 'seguridad', fields: [] })
    },
    {
        id: 'inspeccion_linea_vida',
        nombre: 'Inspección Línea de Vida Vertical',
        codigo: 'FT-HES-301',
        descripcion: 'Formato de inspección de sistemas de línea de vida',
        version: 1,
        schema: JSON.stringify({ categoria: 'inspeccion', fields: [] })
    },
    {
        id: 'mantenimiento_cctv',
        nombre: 'Formato Mantenimiento CCTV',
        codigo: 'FT-MNT-401',
        descripcion: 'Registro de mantenimiento preventivo/correctivo',
        version: 1,
        schema: JSON.stringify({ categoria: 'operativo', fields: [] })
    }
];

async function main() {
    console.log('Seeding forms...');
    for (const form of forms) {
        const upserted = await prisma.formularioTemplate.upsert({
            where: { id: form.id },
            update: {
                nombre: form.nombre,
                schema: form.schema,
                activo: true
            },
            create: {
                id: form.id,
                nombre: form.nombre,
                descripcion: form.descripcion,
                schema: form.schema,
                activo: true
            }
        });
        console.log(`Upserted form: ${upserted.id}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
