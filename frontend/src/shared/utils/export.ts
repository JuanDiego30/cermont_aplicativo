/**
 * Export Utilities
 * Utilidades de exportación de datos a CSV, Excel, PDF y ZIP
 */

// Tipo para columnas de exportación
export type ExportColumn = {
  key: string;
  header: string;
  width?: number;
  format?: (value: unknown) => string;
};

/**
 * Exportar datos a CSV
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string
): void {
  // Generar cabecera
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  // Generar filas
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      
      // Aplicar formato si existe
      if (col.format) {
        value = col.format(value);
      }
      
      // Escapar comillas y envolver en comillas
      if (value === null || value === undefined) {
        return '""';
      }
      const strValue = String(value).replace(/"/g, '""');
      return `"${strValue}"`;
    }).join(',');
  });
  
  // Combinar todo con BOM para Excel
  const BOM = '\uFEFF';
  const csvContent = BOM + headers + '\n' + rows.join('\n');
  
  // Descargar
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
}

/**
 * Exportar datos a Excel
 */
export async function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
  sheetName: string = 'Datos'
): Promise<void> {
  try {
    // @ts-expect-error - xlsx es opcional
    const XLSX = await import('xlsx').catch(() => null);
    
    if (!XLSX) {
      throw new Error('xlsx no disponible');
    }
    
    // Preparar datos con headers
    const wsData = [
      columns.map(c => c.header),
      ...data.map(row => columns.map(col => {
        let value = row[col.key];
        if (col.format) value = col.format(value);
        return value;
      }))
    ];
    
    // Crear libro y hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Configurar anchos de columna
    const colWidths = columns.map(col => ({ wch: col.width || 15 }));
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Descargar
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch {
    // Fallback a CSV si xlsx no está disponible
    console.warn('xlsx no disponible, exportando como CSV');
    exportToCSV(data, columns, filename);
  }
}

/**
 * Generar y descargar PDF
 */
export async function exportToPDF(
  htmlContent: string,
  filename: string,
  options: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'A4' | 'letter';
  } = {}
): Promise<void> {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('No se pudo abrir ventana de impresión. Permite ventanas emergentes.');
  }
  
  const { title = 'Documento', orientation = 'portrait' } = options;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <style>
        @page {
          size: ${options.pageSize || 'A4'} ${orientation};
          margin: 1.5cm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          color: #999;
          padding: 10px;
          border-top: 1px solid #ddd;
        }
        @media print {
          .no-print { display: none; }
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <div class="footer">
        Generado el ${new Date().toLocaleString('es-CO')} - CERMONT S.A.S.
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
}

/**
 * Descargar múltiples archivos como ZIP
 */
export async function exportToZIP(
  files: { name: string; content: string | Blob; type?: string }[],
  zipFilename: string
): Promise<void> {
  try {
    // @ts-expect-error - jszip es opcional
    const JSZipModule = await import('jszip').catch(() => null);
    
    if (!JSZipModule) {
      throw new Error('jszip no disponible');
    }
    
    const JSZip = JSZipModule.default;
    const zip = new JSZip();
    
    for (const file of files) {
      zip.file(file.name, file.content);
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${zipFilename}.zip`);
  } catch {
    console.warn('JSZip no disponible, descargando archivos individualmente');
    for (const file of files) {
      if (file.content instanceof Blob) {
        downloadBlob(file.content, file.name);
      } else {
        downloadFile(file.content, file.name, file.type || 'text/plain');
      }
    }
  }
}

/**
 * Generar HTML de tabla para PDF
 */
export function generateTableHTML(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  title?: string,
  subtitle?: string
): string {
  const headerRow = columns.map(col => `<th>${col.header}</th>`).join('');
  
  const bodyRows = data.map(row => {
    const cells = columns.map(col => {
      let value = row[col.key];
      if (col.format) value = col.format(value);
      return `<td>${value ?? ''}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  return `
    ${title ? `
      <div class="header">
        <div>
          <div class="title">${title}</div>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        </div>
        <div class="subtitle">Fecha: ${new Date().toLocaleDateString('es-CO')}</div>
      </div>
    ` : ''}
    <table>
      <thead>
        <tr>${headerRow}</tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
    <div style="margin-top: 20px; font-size: 11px; color: #666;">
      Total de registros: ${data.length}
    </div>
  `;
}

/**
 * Helper para descargar archivo de texto
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Helper para descargar blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formateadores comunes para exportación
 */
export const formatters = {
  date: (value: string | Date) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-CO');
  },
  
  datetime: (value: string | Date) => {
    if (!value) return '';
    return new Date(value).toLocaleString('es-CO');
  },
  
  currency: (value: number) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  },
  
  number: (value: number) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('es-CO').format(value);
  },
  
  percentage: (value: number) => {
    if (value === null || value === undefined) return '';
    return `${(value * 100).toFixed(1)}%`;
  },
  
  boolean: (value: boolean) => value ? 'Sí' : 'No',
  
  status: (value: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En progreso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado',
      'draft': 'Borrador',
      'submitted': 'Enviado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
    };
    return statusMap[value] || value;
  }
};
