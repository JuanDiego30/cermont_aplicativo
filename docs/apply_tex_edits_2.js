// apply_tex_edits_2.js — Remaining audit corrections
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
// 1. main.tex — Add TypeScript lstlisting config after YAML definition
// ============================================================
console.log("\n[1] main.tex — Add TypeScript lstlisting config");
let mainTex = read("main.tex");
const lstTypeScript = `
% Definición de lenguaje TypeScript para listings
\\lstdefinelanguage{TypeScript}{
  keywords={break,case,catch,continue,debugger,default,delete,do,else,finally,for,function,if,in,instanceof,new,return,switch,this,throw,try,typeof,var,void,while,with,as,from,implements,interface,let,package,private,protected,public,static,type,yield,enum,extends,super,abstract,async,await,const,export,import,declare,class,readonly,override},
  keywordstyle=\\color{institucionalBlue}\\bfseries,
  ndkeywords={boolean,date,number,string,void,any,never,null,undefined,unknown},
  ndkeywordstyle=\\color{institucionalRed}\\bfseries,
  sensitive=true,
  comment=[l]{//},
  morecomment=[s]{/*}{*/},
  commentstyle=\\color{gray}\\ttfamily,
  stringstyle=\\color{institucionalBlue},
  morestring=[b]',
  morestring=[b]",
  morestring=[b]',
}

\\lstset{
  language=TypeScript,
  basicstyle=\\ttfamily\\scriptsize,
  breaklines=true,
  frame=single,
  framerule=0.4pt,
  rulecolor=\\color{institucionalGrey},
  backgroundcolor=\\color{white},
  showstringspaces=false,
  tabsize=2,
  captionpos=b,
  numbers=none,
}`;
const yamlEndMarker = '  morestring=[b]"\n}';
const insertAfterYaml = yamlEndMarker + "\n" + lstTypeScript;
mainTex = mainTex.replace(yamlEndMarker, insertAfterYaml);
write("main.tex", mainTex);

// ============================================================
// 2. Fix captions missing "Fuente: Elaboración propia"
// ============================================================
console.log("\n[2] Fixing captions without Fuente: Elaboración propia");

const captionFixes = {
	"Capitulos/Capitulo_6.tex": [
		{
			from: "\\caption{Matriz de estado de implementación}",
			to: "\\caption{Matriz de estado de implementación. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Módulos operativos principales (Pasos 1-14)}",
			to: "\\caption{Módulos operativos principales (Pasos 1-14). Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Diagrama de base documental y relaciones lógicas}",
			to: "\\caption{Diagrama de base documental y relaciones lógicas. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Flujo propuesto para extracción estructurada de documentos}",
			to: "\\caption{Flujo propuesto para extracción estructurada de documentos. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Comparativa del stack implementado frente a alternativas evaluadas}",
			to: "\\caption{Comparativa del stack implementado frente a alternativas evaluadas. Fuente: Elaboración propia.}",
		},
	],
	"Capitulos/Capitulo_8.tex": [
		{
			from: "\\caption{Matriz final de validación y estado de cumplimiento técnico}",
			to: "\\caption{Matriz final de validación y estado de cumplimiento técnico. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Matriz de aceptación cualitativa por perfil de usuario}",
			to: "\\caption{Matriz de aceptación cualitativa por perfil de usuario. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Trazabilidad: objetivos del proyecto y pruebas de validación}",
			to: "\\caption{Trazabilidad: objetivos del proyecto y pruebas de validación. Fuente: Elaboración propia.}",
		},
	],
	"Capitulos/Capitulo_5.tex": [
		{
			from: "\\caption{Fases metodológicas del proyecto}",
			to: "\\caption{Fases metodológicas del proyecto. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Indicadores propuestos para validación con datos reales}",
			to: "\\caption{Indicadores propuestos para validación con datos reales. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Compuertas de calidad aplicadas por iteración de desarrollo}",
			to: "\\caption{Compuertas de calidad aplicadas por iteración de desarrollo. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Matriz de trazabilidad: objetivos, fases, actividades y entregables}",
			to: "\\caption{Matriz de trazabilidad: objetivos, fases, actividades y entregables. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Distribución temporal de las actividades del proyecto}",
			to: "\\caption{Distribución temporal de las actividades del proyecto. Fuente: Elaboración propia.}",
		},
	],
	"Capitulos/Capitulo_3.tex": [
		{
			from: "\\caption{Plataformas comerciales relacionadas con gestión de campo y mantenimiento}",
			to: "\\caption{Plataformas comerciales relacionadas con gestión de campo y mantenimiento. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Repositorios y proyectos abiertos revisados}",
			to: "\\caption{Repositorios y proyectos abiertos revisados. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Librerías de formularios dinámicos aplicables al proyecto}",
			to: "\\caption{Librerías de formularios dinámicos aplicables al proyecto. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Herramientas para extracción documental}",
			to: "\\caption{Herramientas para extracción documental. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Comparación de proyectos open source de gestión de servicios de campo}",
			to: "\\caption{Comparación de proyectos open source de gestión de servicios de campo. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Antecedentes académicos colombianos relacionados con la problemática}",
			to: "\\caption{Antecedentes académicos colombianos relacionados con la problemática. Fuente: Elaboración propia.}",
		},
		{
			from: "\\caption{Criterios de evaluación para la decisión de desarrollar vs. adoptar}",
			to: "\\caption{Criterios de evaluación para la decisión de desarrollar vs. adoptar. Fuente: Elaboración propia.}",
		},
	],
	"Capitulos/Capitulo_1.tex": [
		{
			from: "\\caption{Matriz de análisis de actores interesados del proyecto}",
			to: "\\caption{Matriz de análisis de actores interesados del proyecto. Fuente: Elaboración propia.}",
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
			console.log("  Caption not found in " + file + ": " + fix.from.substring(0, 60) + "...");
		}
	}
	if (changed) {
		write(file, content);
	}
}

console.log("\n=== All remaining edits applied ===");
