const fs = require('fs');
const path = 'apps/api/prisma/schema.prisma';
try {
    let content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);
    // Replace first few lines with clean strings to avoid encoding garbage
    lines[0] = '// Prisma Schema para Cermont';
    lines[1] = '// Version 2.0.0';

    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log('Cleaned header');
} catch (e) { console.error(e); }
