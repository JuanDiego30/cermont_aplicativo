import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'apps/api/logs');
const logFile = 'error-2025-12-20.log'; // Update if date changed
const filePath = path.join(logDir, logFile);

if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    console.log(`Scanning ${lines.length} lines in ${logFile}...`);

    const errors = lines.filter(line => line.includes('DashboardController'));
    console.log(`Found ${errors.length} DashboardController errors.`);

    errors.forEach(err => console.log(JSON.stringify(JSON.parse(err), null, 2)));
} else {
    console.log('Log file not found');
}
