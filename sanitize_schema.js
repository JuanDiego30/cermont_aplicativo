const fs = require('fs');
const path = 'apps/api/prisma/schema.prisma';

try {
    // Read the file buffer to handle any weird encoding
    const buffer = fs.readFileSync(path);
    let content = buffer.toString('utf8');

    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    // Replace ANY character that is not standard printable ASCII or valid Spanish accented chars or newline
    // This is aggressive but necessary for the corrupted file
    // Keeping: \n, \r, \t, space, special chars used in prisma @ " {} [] () etc.
    // And Spanish accents: áéíóúÁÉÍÓÚñÑ

    // Simplification: valid typescript/prisma source usually matches a predictable regex
    // We will just strip "Replacement Character" \uFFFD and other weird control chars
    content = content.replace(/\uFFFD/g, '');

    // Explicitly fix the known corrupted headers
    content = content.replace(/Sistema de Gesti[Ã\u00C3].+n de [Ã\u00C3].+rdenes/g, 'Sistema de Gestion de Ordenes');
    content = content.replace(/Versi[Ã\u00C3].+n/g, 'Version');
    content = content.replace(/FORMULARIOS DIN[Ã\u00C3].+MICOS/g, 'FORMULARIOS DINAMICOS');
    content = content.replace(/AUTENTICACI[Ã\u00C3].+N/g, 'AUTENTICACION');
    content = content.replace(/[Ã\u00C3]+RDENES/g, 'ORDENES');

    fs.writeFileSync(path, content, 'utf8');
    console.log('Sanitized schema.prisma');
} catch (e) {
    console.error(e);
}
