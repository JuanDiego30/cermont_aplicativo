const fs = require("fs");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function readFirstJsonLine(path) {
  const firstLine = fs.readFileSync(path, "utf8").split(/\r?\n/)[0];
  return JSON.parse(firstLine);
}

function matchPair(dup, a, b) {
  if (!dup || !dup.firstFile || !dup.secondFile) return false;
  const n1 = dup.firstFile.name;
  const n2 = dup.secondFile.name;
  return (n1 === a && n2 === b) || (n1 === b && n2 === a);
}

function main() {
  const report = readJson("report/html/jscpd-report.json");
  const duplicates = report.duplicates || [];

  const top = readFirstJsonLine("analysis_result.txt");
  const a = top.file1;
  const b = top.file2;

  const hits = duplicates.filter((d) => matchPair(d, a, b));

  console.log("TOP", top);
  console.log("HITS", hits.length);
  if (hits.length > 0) {
    const h = hits[0];
    console.log(
      JSON.stringify(
        {
          lines: h.lines,
          first: h.firstFile,
          second: h.secondFile,
        },
        null,
        2,
      ),
    );
  }

  // También imprime si quedan clones para las parejas históricas
  const pairs = [
    [
      "apps\\api\\src\\modules\\hes\\application\\mappers\\hes.mapper.ts",
      "apps\\api\\src\\modules\\hes\\infrastructure\\persistence\\hes.prisma.mapper.ts",
    ],
    [
      "apps\\api\\src\\modules\\formularios\\domain\\entities\\form-submission.entity.ts",
      "apps\\api\\src\\modules\\formularios\\domain\\services\\form-validator.service.ts",
    ],
  ];

  for (const [p, q] of pairs) {
    const count = duplicates.filter((d) => matchPair(d, p, q)).length;
    console.log("PAIR_HITS", p, "<->", q, count);
  }
}

main();
