const codeFrameModule = require('next/dist/compiled/babel/code-frame');

function normalizePoint(point) {
  if (!point) {
    return { line: 0, column: 0 };
  }
  const line = Number.isFinite(point.line) ? point.line : 0;
  const column = Number.isFinite(point.column) ? point.column : 0;
  return {
    line: Math.max(0, line),
    column: Math.max(0, column),
  };
}

function sanitizeLocation(location) {
  if (!location) {
    return location;
  }
  const start = normalizePoint(location.start);
  const end = normalizePoint(location.end ?? location.start ?? start);
  if (end.line < start.line) {
    end.line = start.line;
  }
  if (end.line === start.line && end.column < start.column) {
    end.column = start.column;
  }

  return {
    ...location,
    start,
    end,
  };
}

const originalCodeFrameColumns = codeFrameModule.codeFrameColumns;
function safeCodeFrameColumns(rawLines, loc, opts = {}) {
  if (!rawLines) {
    return originalCodeFrameColumns(rawLines, loc, opts);
  }
  const safeLoc = sanitizeLocation(loc);
  return originalCodeFrameColumns(rawLines, safeLoc, opts);
}

codeFrameModule.codeFrameColumns = safeCodeFrameColumns;
if (codeFrameModule.default && codeFrameModule.default !== originalCodeFrameColumns) {
  codeFrameModule.default = safeCodeFrameColumns;
}
