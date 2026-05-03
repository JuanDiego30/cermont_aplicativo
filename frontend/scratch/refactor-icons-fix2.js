const fs = require("node:fs");
const path = require("node:path");
const dir =
	"c:\\\\Users\\\\camil\\\\Downloads\\\\cermont_aplicativo\\\\cermont_aplicativo\\\\frontend\\\\public\\\\icons";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg") && f !== "logo-cermont.svg");

files.forEach((f) => {
	let content = fs.readFileSync(path.join(dir, f), "utf8");

	// We want to add class="cermont-icon" to the <svg> tag if it doesn't have it.
	// First, extract the svg tag string.
	const svgTagMatch = content.match(/<svg[\s\S]*?>/);
	if (svgTagMatch) {
		const svgTag = svgTagMatch[0];
		if (!svgTag.includes("cermont-icon")) {
			let newSvgTag = svgTag;
			if (newSvgTag.includes('class="')) {
				newSvgTag = newSvgTag.replace(/class="/, 'class="cermont-icon ');
			} else {
				newSvgTag = newSvgTag.replace(/<svg\b/, '<svg class="cermont-icon"');
			}
			content = content.replace(svgTag, newSvgTag);
			fs.writeFileSync(path.join(dir, f), content);
		}
	}
});

console.log("Fixed classes accurately on icons.");
