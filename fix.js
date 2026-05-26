const fs = require("node:fs");
const path =
	"C:\\Users\\camil\\Downloads\\cermont_aplicativo\\cermont_aplicativo\\backend\\src\\index.ts";

let content = fs.readFileSync(path, "utf8");

// Remove the bad line 251
content = content.replace(/app\.use\(\s*\\s\/api\/custom-fields\\s*,\s*customFieldRoutes\);/g, "");

fs.writeFileSync(path, content);
console.log("Fixed!");
