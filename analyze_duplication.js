const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('report/html/jscpd-report.json', 'utf8'));
    const top = report.duplicates.sort((a, b) => b.lines - a.lines).slice(0, 20);
    const output = [];
    top.forEach(d => {
        output.push(JSON.stringify({ lines: d.lines, file1: d.firstFile.name, file2: d.secondFile.name }));
    });
    output.push('Stats: ' + JSON.stringify(report.statistics || report.statistic));
    fs.writeFileSync('analysis_result.txt', output.join('\n'));
} catch (e) {
    fs.writeFileSync('analysis_error.txt', e.toString());
}
