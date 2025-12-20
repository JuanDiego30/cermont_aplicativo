const fs = require('fs');
const path = 'apps/api/prisma/schema.prisma';

try {
    let content = fs.readFileSync(path, 'latin1'); // Read as latin1 to preserve weird bytes if they are single-byte

    // Replace the corrupted header
    content = content.replace('Sistema de GestiÃ³n de Ã“rdenes', 'Sistema de Gestion de Ordenes');
    content = content.replace('VersiÃ³n: 2.0.0 - CORREGIDO', 'Version: 2.0.0 - CORREGIDO');

    // Fix other common encoding issues if any (e.g. Ã“ -> Ó)
    // But mostly just want to ensure it's valid UTF-8 when saving

    // The previous write via Node should have been UTF-8, but the initial read via PowerShell might have messed it up.
    // Let's just blindly write it back as UTF-8

    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed schema.prisma encoding');
} catch (err) {
    console.error('Error fixing file:', err);
    process.exit(1);
}
