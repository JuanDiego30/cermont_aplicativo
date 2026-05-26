// Helper script to create .tex files for the Libro directory
const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "..", "Libro", "Figuras");

// 1. piramide_pruebas.tex
const piramide = `% Figura: Pirámide de pruebas del proyecto CERMONT
% Estrategia de cobertura por capas: unitarias, integración y aceptación
\\begin{figure}[H]
\\centering
\\begin{tikzpicture}[font=\\sffamily]
  % Capa base — Pruebas unitarias (60%)
  \\fill[institucionalBlue!25] (-4.5,0) -- (4.5,0) -- (2.7,2.0) -- (-2.7,2.0) -- cycle;
  \\draw[institucionalBlue, thick] (-4.5,0) -- (4.5,0) -- (2.7,2.0) -- (-2.7,2.0) -- cycle;
  \\node[font=\\small\\bfseries, text=institucionalBlue] at (0,1.35) {Pruebas unitarias};
  \\node[font=\\tiny, text=institucionalBlue] at (0,0.7) {Zod schemas $\\cdot$ RBAC $\\cdot$ Domain rules $\\cdot$ FSM $\\cdot$ Services};
  \\node[font=\\tiny\\bfseries, text=institucionalBlue] at (3.2,0.9) {60\\%};

  % Capa intermedia — Pruebas de integración (30%)
  \\fill[institucionalBlue!45] (-2.7,2.1) -- (2.7,2.1) -- (1.35,4.1) -- (-1.35,4.1) -- cycle;
  \\draw[institucionalBlue, thick] (-2.7,2.1) -- (2.7,2.1) -- (1.35,4.1) -- (-1.35,4.1) -- cycle;
  \\node[font=\\small\\bfseries, text=white] at (0,3.4) {Pruebas de integración};
  \\node[font=\\tiny, text=white] at (0,2.8) {Express API $\\cdot$ Supertest $\\cdot$ MongoDB sandbox};
  \\node[font=\\tiny\\bfseries, text=white] at (2.1,2.85) {30\\%};

  % Cima — Aceptación cualitativa (10%)
  \\fill[institucionalRed!70] (-1.35,4.2) -- (1.35,4.2) -- (0,5.8) -- cycle;
  \\draw[institucionalRed, thick] (-1.35,4.2) -- (1.35,4.2) -- (0,5.8) -- cycle;
  \\node[font=\\small\\bfseries, text=white] at (0,5.1) {Aceptación};
  \\node[font=\\tiny\\bfseries, text=white] at (1.7,4.9) {10\\%};

  % Etiquetas laterales
  \\node[font=\\tiny, text=institucionalBlue, align=left, anchor=west] at (5.0,0.5) {Vitest puro};
  \\node[font=\\tiny, text=institucionalBlue, align=left, anchor=west] at (5.0,1.3) {Aislado, rápido};
  \\node[font=\\tiny, text=institucionalBlue, align=left, anchor=west] at (5.0,3.0) {Vitest + Supertest};
  \\node[font=\\tiny, text=institucionalBlue, align=left, anchor=west] at (5.0,3.7) {BD en memoria};
  \\node[font=\\tiny, text=institucionalRed, align=left, anchor=west] at (5.0,5.1) {Por rol de usuario};

  % Leyenda inferior
  \\draw[figArrow] (-4.5,-0.5) -- (4.5,-0.5);
  \\node[font=\\tiny, text=institucionalBlue] at (0,-0.9) {153 pruebas $\\cdot$ 22 archivos $\\cdot$ 2.51 s de ejecución};
\\end{tikzpicture}
\\caption{Pirámide de pruebas: distribución de la estrategia de cobertura por capas. Fuente: Elaboración propia.}
\\label{fig:piramide-pruebas}
\\end{figure}`;

// 2. secuencia_offline_sync.tex
const offlineSync = `% Figura: Secuencia de sincronización offline (Serwist 9.x + IndexedDB)
\\begin{figure}[H]
\\centering
\\resizebox{0.98\\textwidth}{!}{%
\\begin{tikzpicture}[font=\\sffamily]
\\tikzset{
  actor/.style={figHeader, minimum width=2.4cm, minimum height=0.68cm, font=\\scriptsize\\bfseries},
  line/.style={dashed, draw=institucionalGrey, line width=0.7pt},
  note/.style={figBoxWhite, font=\\tiny, text width=2.5cm, minimum width=2.6cm}
}
\\node[actor] (tech) at (0,0) {Técnico\\\\en Campo};
\\node[actor] (ui) at (3,0) {Frontend\\\\React};
\\node[actor] (sw) at (6,0) {Service\\\\Worker};
\\node[actor] (idb) at (9,0) {IndexedDB};
\\node[actor] (api) at (12,0) {API\\\\Express};
\\node[actor] (mongo) at (15,0) {MongoDB};
\\foreach \\x in {0,3,6,9,12,15}{\\draw[line] (\\x,-0.45) -- (\\x,-10.5);}

% Fase 1: Operación offline
\\draw[figArrow] (0,-1.0) -- node[above, font=\\tiny] {1. Registrar evidencia} (3,-1.0);
\\draw[figArrow] (3,-1.7) -- node[above, font=\\tiny] {2. POST /api/evidences} (6,-1.7);
\\draw[figArrow] (6,-2.3) -- node[above, font=\\tiny] {3. Offline: intercepta} (9,-2.3);
\\node[note] at (4.5,-3.1) {4. UI optimista: sincronizado localmente};
\\draw[figArrow] (3,-2.8) -- (3,-3.5);
\\draw[figArrowCritical] (9,-2.6) -- node[right, font=\\tiny] {5. Serializa payload + Base64} (9,-3.5);

% Fase 2: Almacenamiento local
\\node[note] at (9,-4.3) {6. IndexedDB almacena petición con clientMutationId};
\\draw[figArrow] (9,-4.8) -- node[above, font=\\tiny] {7. Registra tag sync} (6,-4.8);

% Fase 3: Recuperación de conexión
\\draw[figArrow] (6,-5.6) -- node[above, font=\\tiny] {8. Background Sync API} (12,-5.6);
\\draw[figArrow] (9,-6.3) -- node[above, font=\\tiny] {9. Lee cola pendiente} (6,-6.3);
\\draw[figArrow] (6,-7.0) -- node[above, font=\\tiny] {10. Envía POST real} (12,-7.0);

% Fase 4: Persistencia y confirmación
\\draw[figArrow] (12,-7.7) -- node[above, font=\\tiny] {11. Persiste documento} (15,-7.7);
\\draw[figArrow] (15,-8.3) -- node[above, font=\\tiny] {12. HTTP 201 Created} (12,-8.3);
\\draw[figArrow] (12,-8.9) -- node[above, font=\\tiny] {13. Confirma al SW} (6,-8.9);
\\draw[figArrow] (6,-9.5) -- node[above, font=\\tiny] {14. Elimina de IndexedDB} (9,-9.5);
\\draw[figArrow] (3,-10.0) -- (3,-10.3);
\\node[note] at (1.5,-10.4) {15. UI: Sincronizado};

\\node[figNote, text width=4.4cm] at (12.5,-10.8) {Se utiliza clientMutationId para garantizar idempotencia y evitar duplicados al reintentar.};
\\end{tikzpicture}%
}
\\caption[Secuencia de sincronización offline]{Secuencia de sincronización offline: captura local, almacenamiento en IndexedDB, envío diferido y confirmación. Fuente: Elaboración propia.}
\\label{fig:secuencia-offline-sync}
\\end{figure}`;

// Write files
fs.writeFileSync(path.join(basePath, "piramide_pruebas.tex"), piramide, "utf8");
console.log("Created: " + path.join(basePath, "piramide_pruebas.tex"));

fs.writeFileSync(path.join(basePath, "secuencia_offline_sync.tex"), offlineSync, "utf8");
console.log("Created: " + path.join(basePath, "secuencia_offline_sync.tex"));

console.log("All .tex files created successfully.");
