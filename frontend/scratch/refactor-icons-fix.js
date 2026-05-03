const fs = require("node:fs");
const path = require("node:path");
const dir =
	"c:\\\\Users\\\\camil\\\\Downloads\\\\cermont_aplicativo\\\\cermont_aplicativo\\\\frontend\\\\public\\\\icons";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg") && f !== "logo-cermont.svg");

files.forEach((f) => {
	let content = fs.readFileSync(path.join(dir, f), "utf8");

	// Add cermont-icon class to svg. It might be multiline
	// Check if it already has class
	if (!content.includes("cermont-icon")) {
		if (content.match(/<svg[^>]*class="/)) {
			content = content.replace(/(<svg[^>]*class=")/, "$1cermont-icon ");
		} else {
			// Find <svg and add class="cermont-icon" after it
			content = content.replace(/<svg\b/, '<svg class="cermont-icon"');
		}
	}

	fs.writeFileSync(path.join(dir, f), content);
});

console.log(`Fixed classes on ${files.length} icons.`);
