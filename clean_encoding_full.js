const fs = require('fs');
const path = 'apps/api/prisma/schema.prisma';

try {
    let content = fs.readFileSync(path, 'utf8');
    // Replace corrupted chars in comments or anywhere
    // Common double-encoded UTF-8 sequences for Spanish accents
    content = content.replace(/Ãƒâ€œ/g, 'O');
    content = content.replace(/ÃƒÂ/g, 'A');
    content = content.replace(/ÃƒÂ±/g, 'n');
    content = content.replace(/ÃƒÂ©/g, 'e');
    content = content.replace(/ÃƒÂ³/g, 'o');
    content = content.replace(/ÃƒÂa/g, 'i');
    content = content.replace(/ÃƒÂº/g, 'u');
    content = content.replace(/Ã“/g, 'O');
    content = content.replace(/Ã³/g, 'o');
    content = content.replace(/Ã©/g, 'e');
    content = content.replace(/Ã¡/g, 'a');
    content = content.replace(/Ã±/g, 'n');

    // Also generic cleanup of non-ascii in comments?
    // Maybe too aggressive, but let's try to fix the known ones seen in view_file.

    fs.writeFileSync(path, content, 'utf8');
    console.log('Cleaned schema encoding artifacts');
} catch (e) { console.error(e); }
