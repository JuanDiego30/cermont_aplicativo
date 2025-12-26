export class BaseTemplate {
    static getStyles(): string {
        return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          border-bottom: 3px solid #0066cc;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }
        
        .header-logo {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
        }
        
        .document-info {
          text-align: right;
          font-size: 11px;
          color: #666;
        }
        
        h1 {
          font-size: 20px;
          color: #0066cc;
          margin-bottom: 20px;
        }
        
        h2 {
          font-size: 16px;
          color: #333;
          margin-top: 20px;
          margin-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 5px;
        }
        
        h3 {
          font-size: 14px;
          color: #666;
          margin-top: 15px;
          margin-bottom: 8px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .info-item {
          padding: 10px;
          background: #f8f9fa;
          border-left: 3px solid #0066cc;
        }
        
        .info-label {
          font-weight: bold;
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .info-value {
          color: #333;
          font-size: 13px;
          margin-top: 3px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th {
          background: #0066cc;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        td {
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .badge-success {
          background: #d4edda;
          color: #155724;
        }
        
        .badge-warning {
          background: #fff3cd;
          color: #856404;
        }
        
        .badge-danger {
          background: #f8d7da;
          color: #721c24;
        }
        
        .badge-info {
          background: #d1ecf1;
          color: #0c5460;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
        
        .signature-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 50px;
          margin-top: 60px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-top: 2px solid #333;
          margin-top: 50px;
          padding-top: 10px;
        }
        
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    `;
    }

    static getHeader(companyName: string = 'CERMONT'): string {
        return `
      <div class="header">
        <div class="header-logo">
          <div class="company-name">${companyName}</div>
          <div class="document-info">
            Fecha: ${new Date().toLocaleDateString('es-CO')}
          </div>
        </div>
      </div>
    `;
    }

    static getFooter(): string {
        return `
      <div class="footer">
        <p>© ${new Date().getFullYear()} Cermont - Sistema de Gestión de Mantenimiento</p>
        <p>Documento generado automáticamente</p>
      </div>
    `;
    }

    static wrap(title: string, content: string): string {
        return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${this.getStyles()}
      </head>
      <body>
        <div class="container">
          ${this.getHeader()}
          ${content}
          ${this.getFooter()}
        </div>
      </body>
      </html>
    `;
    }
}
