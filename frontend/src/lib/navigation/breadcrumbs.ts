export const BREADCRUMB_LABELS: Record<string, string> = {
  '/dashboard': 'Panel de Control',
  '/service-cases': 'Casos de Servicio',
  '/work-requests': 'Solicitudes de Trabajo',
  '/site-visits': 'Visitas Técnicas',
  '/proposals': 'Propuestas',
  '/purchase-orders': 'Órdenes de Compra',
  '/orders': 'Órdenes de Trabajo',
  '/planning': 'Planeación',
  '/execution': 'Ejecución',
  '/evidences': 'Evidencias',
  '/dispatch': 'Despacho',
  '/maintenance': 'Mantenimiento',
  '/sla': 'SLA',
  '/reports': 'Informes Técnicos',
  '/reports/analytics': 'Analítica',
  '/delivery-records': 'Actas de Entrega',
  '/billing': 'Cierre Administrativo',
  '/billing/ses': 'SES / Ariba',
  '/billing/invoices': 'Facturación',
  '/payments': 'Pagos',
  '/costs': 'Costos',
  '/documents': 'Documentos',
  '/templates': 'Formularios',
  '/resources': 'Recursos & Kits',
  '/inventory': 'Inventario',
  '/inventory/scan': 'Escanear Activos',
  '/fleet': 'Parque Automotor',
  '/assets': 'Activos',
  '/admin/users': 'Usuarios',
  '/admin/custom-fields': 'Campos Personalizados',
  '/admin/personnel': 'Personal y Certificaciones',
  '/admin/backups': 'Respaldos',
  '/admin/audit': 'Auditoría',
  '/admin/settings': 'Configuración',
  '/admin/erp-connectors': 'Conectores ERP',
};

export function getBreadcrumbLabel(path: string): string {
  if (BREADCRUMB_LABELS[path]) { return BREADCRUMB_LABELS[path]; }
  const segments = path.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const parentPath = `/${segments.slice(0, i).join('/')}`;
    if (BREADCRUMB_LABELS[parentPath]) { return BREADCRUMB_LABELS[parentPath]; }
  }
  return 'Cermont';
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function getBreadcrumbItems(path: string): BreadcrumbItem[] {
  const segments = path.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }];
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = BREADCRUMB_LABELS[currentPath] || segment;
    items.push({ label, href: currentPath });
  }
  return items;
}
