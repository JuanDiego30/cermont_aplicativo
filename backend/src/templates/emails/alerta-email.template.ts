export interface AlertaEmailTemplateInput {
  titulo: string;
  mensaje: string;
  prioridadLabel: string;
  prioridadCssClass: string;
  prioridadColor: string;
  fechaLocaleString: string;
}

export function renderAlertaEmailHtml(input: AlertaEmailTemplateInput): string {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container { 
              background-color: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header { 
              border-left: 4px solid ${input.prioridadColor}; 
              padding: 20px; 
              background-color: #f9f9f9;
              border-radius: 4px;
              margin-bottom: 20px;
            }
            .priority { 
              display: inline-block; 
              padding: 4px 12px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            .priority.critical { background-color: #FF0000; color: white; }
            .priority.error { background-color: #FF6B6B; color: white; }
            .priority.warning { background-color: #FFA500; color: white; }
            .priority.info { background-color: #4CAF50; color: white; }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              font-size: 12px; 
              color: #666; 
              text-align: center;
            }
            .message {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin-top: 0;">${input.titulo}</h2>
              <p><span class="priority ${input.prioridadCssClass}">${input.prioridadLabel}</span></p>
              <div class="message">
                <p style="margin: 0;">${input.mensaje}</p>
              </div>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático del sistema <strong>Cermont</strong>.</p>
              <p>Fecha: ${input.fechaLocaleString}</p>
              <p style="color: #999; font-size: 11px;">No responda a este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `;
}

export function renderAlertaEmailText(
  input: Omit<AlertaEmailTemplateInput, 'prioridadCssClass' | 'prioridadColor'>
): string {
  return `
${input.titulo}

Prioridad: ${input.prioridadLabel}

${input.mensaje}

---
Este es un mensaje automático del sistema Cermont.
Fecha: ${input.fechaLocaleString}
    `.trim();
}
