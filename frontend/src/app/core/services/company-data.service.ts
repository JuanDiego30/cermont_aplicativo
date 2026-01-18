import { computed, Injectable, signal } from '@angular/core';

/**
 * CompanyDataService - CERMONT S.A.S. Corporate Data
 * Source: INDUCCION-SGSST.pdf
 */

export interface CompanyStat {
  value: string;
  label: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Certification {
  name: string;
  acronym: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyDataService {
  // Company founding date
  private readonly foundingDate = new Date('2008-06-12');

  // Computed experience (years since founding)
  readonly experience = computed(() => {
    const now = new Date();
    return Math.floor((now.getTime() - this.foundingDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  });

  // Mission statement
  readonly mission = signal<string>(
    'Prestar en todo el territorio nacional un servicio eficiente en construcción, ' +
    'mantenimiento, montajes de obras civiles, eléctricas, refrigeración, telecomunicaciones, ' +
    'suministros de materiales, equipos y personal técnico. Contando con un recurso humano ' +
    'altamente calificado, tecnología de última generación y los mejores equipos disponibles ' +
    'en el mercado bajo los estándares de calidad exigidos, manejo ambiental y el mejoramiento ' +
    'continuo que garantizan la satisfacción de las expectativas de nuestros clientes.'
  );

  // Vision statement
  readonly vision = signal<string>(
    'Para el año 2026 CERMONT SAS, será una empresa rentable, sólida y en continuo crecimiento, ' +
    'con la mayor participación en el mercado nacional, por la idoneidad de su personal competente, ' +
    'tecnología de última generación, responsabilidad social, alto desempeño y compromiso con el ' +
    'desarrollo sostenible a nivel Nacional.'
  );

  // Corporate values
  readonly values = signal<string[]>([
    'Calidad',
    'Eficiencia',
    'Efectividad',
    'Competitividad',
    'Responsabilidad',
    'Desarrollo Humano',
    'Trabajo en Equipo',
    'Seguridad',
    'Mejora Continua',
  ]);

  // Certifications
  readonly certifications = signal<Certification[]>([
    { name: 'Consejo Colombiano de Seguridad', acronym: 'CCS' },
    { name: 'Registro Uniforme para Contratistas', acronym: 'RUC®' },
  ]);

  // Contact information
  readonly contact = signal({
    phone: '+57 (8) 851188',
    mobile: '+57 310 279 6859',
    email: 'contacto@cermont.com.co',
    address: 'Arauca, Colombia',
  });

  // Company stats for hero section
  getStats(): CompanyStat[] {
    return [
      { value: `${this.experience()}+`, label: 'Años de Experiencia' },
      { value: '100%', label: 'Cobertura Nacional' },
      { value: '6', label: 'Servicios Especializados' },
      { value: 'RUC®', label: 'Certificado' },
    ];
  }

  // Services offered
  getServices(): Service[] {
    return [
      {
        id: 1,
        title: 'Construcción',
        description: 'Obras civiles de alta calidad con estándares internacionales para el sector industrial.',
        icon: this.getIcon('construction'),
        features: ['Edificaciones industriales', 'Infraestructura petrolera', 'Mantenimiento preventivo'],
      },
      {
        id: 2,
        title: 'Electricidad',
        description: 'Instalaciones eléctricas industriales y mantenimiento especializado certificado.',
        icon: this.getIcon('electricity'),
        features: ['Subestaciones eléctricas', 'Sistemas de iluminación', 'Automatización industrial'],
      },
      {
        id: 3,
        title: 'Refrigeración',
        description: 'Sistemas HVAC y climatización industrial de última generación.',
        icon: this.getIcon('refrigeration'),
        features: ['Aires acondicionados industriales', 'Cámaras frigoríficas', 'Mantenimiento preventivo'],
      },
      {
        id: 4,
        title: 'Montajes',
        description: 'Montaje de estructuras metálicas y equipos industriales especializados.',
        icon: this.getIcon('montage'),
        features: ['Estructuras metálicas', 'Equipos industriales', 'Torres de telecomunicaciones'],
      },
      {
        id: 5,
        title: 'Telecomunicaciones',
        description: 'Infraestructura de telecomunicaciones y redes industriales de alta capacidad.',
        icon: this.getIcon('telecom'),
        features: ['Fibra óptica', 'Cableado estructurado', 'Sistemas CCTV'],
      },
      {
        id: 6,
        title: 'Suministro de Personal',
        description: 'Personal técnico altamente calificado y certificado en seguridad industrial.',
        icon: this.getIcon('staff'),
        features: ['Ingenieros especializados', 'Técnicos certificados', 'Personal capacitado HSE'],
      },
    ];
  }

  getMission(): string {
    return this.mission();
  }

  getVision(): string {
    return this.vision();
  }

  getValues(): string[] {
    return this.values();
  }

  getCertifications(): Certification[] {
    return this.certifications();
  }

  getContact() {
    return this.contact();
  }

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      construction: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>`,
      electricity: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>`,
      refrigeration: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.586l2.707-2.707a1 1 0 011.414 1.414L12.414 6H14a1 1 0 110 2h-3v2h3a1 1 0 110 2h-3v2h1.586l2.707 2.707a1 1 0 01-1.414 1.414L11 15.414V17a1 1 0 11-2 0v-1.586l-2.707 2.707a1 1 0 01-1.414-1.414L7.586 14H6a1 1 0 110-2h3v-2H6a1 1 0 110-2h3V6H7.586L4.879 8.707a1 1 0 01-1.414-1.414L6.172 4.586 5 3a1 1 0 011-1h4z"/></svg>`,
      montage: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/></svg>`,
      telecom: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>`,
      staff: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>`,
    };
    return icons[type] || icons['construction'];
  }
}
