import { Injectable } from '@angular/core';
import { Service } from '../models/service.model';

@Injectable({
    providedIn: 'root'
})
export class ServicesService {
    getServices(): Service[] {
        return [
            {
                id: '1',
                title: 'Construcción Civil',
                description: 'Proyectos de construcción integral con los más altos estándares de calidad y seguridad.',
                icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                features: [
                    'Edificaciones comerciales',
                    'Infraestructura industrial',
                    'Proyectos residenciales',
                    'Obras civiles'
                ],
                color: 'primary'
            },
            {
                id: '2',
                title: 'Mantenimiento Industrial',
                description: 'Servicios de mantenimiento preventivo y correctivo para garantizar la operatividad continua.',
                icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                features: [
                    'Mantenimiento preventivo',
                    'Mantenimiento correctivo',
                    'Gestión de activos',
                    'Optimización de procesos'
                ],
                color: 'secondary'
            },
            {
                id: '3',
                title: 'Montajes Electromecánicos',
                description: 'Instalación y montaje de sistemas electromecánicos con tecnología de punta.',
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                features: [
                    'Sistemas eléctricos',
                    'Equipos mecánicos',
                    'Automatización',
                    'Control y monitoreo'
                ],
                color: 'success'
            },
            {
                id: '4',
                title: 'Seguridad y Salud',
                description: 'Programas integrales de SG-SST y cumplimiento normativo ambiental.',
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                features: [
                    'SG-SST certificado',
                    'PESV implementado',
                    'Certificaciones ambientales',
                    'Auditorías de calidad'
                ],
                color: 'warning'
            }
        ];
    }
}
