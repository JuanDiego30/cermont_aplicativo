// apply_tex_edits_3.js — Final caption fixes and table overflow corrections
const fs = require("fs");
const path = require("path");
const basePath = path.join(__dirname, "..", "Libro");

function read(filePath) {
	return fs.readFileSync(path.join(basePath, filePath), "utf8");
}
function write(filePath, content) {
	fs.writeFileSync(path.join(basePath, filePath), content, "utf8");
	console.log("  Written: " + filePath);
}

// ============================================================
// 1. Fix remaining captions without "Fuente: Elaboración propia"
// ============================================================
console.log("\n[1] Fix remaining captions");

const captionFixes = {
	"Capitulos/Capitulo_2.tex": [
		{
			from: "\\caption{Síntesis conceptual y aporte operativo de las bases teóricas}",
			to: "\\caption{Síntesis conceptual y aporte operativo de las bases teóricas. Fuente: Elaboración propia.}",
		},
	],
	"Capitulos/Capitulo_7.tex": [
		{
			from: "\\caption{Indicadores que deben completarse con evidencia verificable}",
			to: "\\caption{Indicadores que deben completarse con evidencia verificable. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Matriz de trazabilidad: objetivos, fases, resultados y evidencias}",
			to: "\\caption{Matriz de trazabilidad: objetivos, fases, resultados y evidencias. Fuente: Elaboración propia.}",
		},
	],
	"Capitulos/Capitulo_4.tex": [
		{
			from: "\\caption{Matriz de trazabilidad: requisitos legales y funcionalidades del sistema}",
			to: "\\caption{Matriz de trazabilidad: requisitos legales y funcionalidades del sistema. Fuente: Elaboración propia.}",
		},
	],
};

for (const [file, fixes] of Object.entries(captionFixes)) {
	let content;
	try {
		content = read(file);
	} catch (e) {
		console.log("  Skipping (not found): " + file);
		continue;
	}
	let changed = false;
	for (const fix of fixes) {
		if (content.includes(fix.from)) {
			content = content.replace(fix.from, fix.to);
			changed = true;
		} else {
			console.log("  Caption not found in " + file + ": " + fix.from.substring(0, 70) + "...");
		}
	}
	if (changed) {
		write(file, content);
	}
}

// ============================================================
// 2. Convert overflow-prone tabular to tabularx where needed
//    The 6-column table in Capitulo_3.tex (page ~29) is most at risk
// ============================================================
console.log("\n[2] Fix table overflow — convert wide tabular to tabularx");
let cap3 = read("Capitulos/Capitulo_3.tex");

// Fix the 6-column comparison table (p{2.5cm}p{2.2cm}x6 = ~13.5cm on ~15cm text area)
// Add \scriptsize and reduce column widths
const oldTable6 = `\\scriptsize
\\begin{tabular}{p{2.5cm}p{2.2cm}p{2.2cm}p{2.2cm}p{2.2cm}p{2.2cm}}`;
const newTable6 = `\\scriptsize
\\begin{tabularx}{\\textwidth}{p{2.2cm}p{2cm}p{2cm}p{2cm}p{2cm}p{2cm}}`;
cap3 = cap3.replace(oldTable6, newTable6);

// Also need to add tabularx closing
const oldEnd6 = `\\end{tabular}

\\vspace{0.3cm}`;
const newEnd6 = `\\end{tabularx}

\\vspace{0.3cm}`;
cap3 = cap3.replace(oldEnd6, newEnd6);

// Fix Capitulo_7.tex table (p{3.2cm}p{6cm}p{4.5cm} = ~13.7cm)
let cap7 = read("Capitulos/Capitulo_7.tex");
const oldTable7 = `\\begin{tabular}{p{3.2cm}p{6cm}p{4.5cm}}`;
const newTable7 = `\\begin{tabularx}{\\textwidth}{p{3cm}X p{4.2cm}}`;
cap7 = cap7.replace(oldTable7, newTable7);
// Also need closing
const oldEnd7 = `\\end{tabular}
\\end{table}

Mientras`;
const newEnd7 = `\\end{tabularx}
\\end{table}

Mientras`;
cap7 = cap7.replace(oldEnd7, newEnd7);

// Fix Capitulo_8.tex table (p{2.6cm}p{4.2cm}p{4.2cm}p{2.6cm} = ~13.6cm)
let cap8 = read("Capitulos/Capitulo_8.tex");
const oldTable8 = `\\begin{tabular}{p{2.6cm}p{4.2cm}p{4.2cm}p{2.6cm}}`;
const newTable8 = `\\begin{tabularx}{\\textwidth}{p{2.4cm}X X p{2.4cm}}`;
cap8 = cap8.replace(oldTable8, newTable8);
const oldEnd8 = `\\end{tabular}
\\end{table}

\\section{Validación cualitativa`;
const newEnd8 = `\\end{tabularx}
\\end{table}

\\section{Validación cualitativa`;
cap8 = cap8.replace(oldEnd8, newEnd8);

write("Capitulos/Capitulo_3.tex", cap3);
write("Capitulos/Capitulo_7.tex", cap7);
write("Capitulos/Capitulo_8.tex", cap8);

// ============================================================
// 3. Normalize caption Fuente capitalization: "elaboración" -> "Elaboración"
// ============================================================
console.log("\n[3] Normalize caption capitalization");
const capFiles = [
	"Capitulos/Capitulo_1.tex",
	"Capitulos/Capitulo_2.tex",
	"Capitulos/Capitulo_3.tex",
	"Capitulos/Capitulo_4.tex",
	"Capitulos/Capitulo_5.tex",
	"Capitulos/Capitulo_6.tex",
	"Capitulos/Capitulo_7.tex",
	"Capitulos/Capitulo_8.tex",
];

for (const cf of capFiles) {
	let content;
	try {
		content = read(cf);
	} catch (e) {
		continue;
	}
	// Normalize: "Fuente: elaboración propia" -> "Fuente: Elaboración propia"
	const fixed = content.replace(/Fuente: elaboración propia/g, "Fuente: Elaboración propia");
	if (fixed !== content) {
		write(cf, fixed);
		console.log("  Normalized capitalization in: " + cf);
	}
}

console.log("\n=== All final edits applied ===");
