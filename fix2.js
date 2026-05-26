const fs = require("node:fs");
const path =
	"C:\\Users\\camil\\Downloads\\cermont_aplicativo\\cermont_aplicativo\\backend\\src\\index.ts";

let content = fs.readFileSync(path, "utf8");

// The exact bad string - note the backslash before space
const badLine = "app.use(\\ /api/custom-fields\\, customFieldRoutes);";

// Replace it - only keep export default app;
content = content.replace(badLine, "");

// Also fix any double newlines created
content = content.replace(/\n\n\n/g, "\n\n");

fs.writeFileSync(path, content);
console.log("Fixed!");
