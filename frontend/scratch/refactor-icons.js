const fs = require("node:fs");
const path = require("node:path");
const dir =
	"c:\\\\Users\\\\camil\\\\Downloads\\\\cermont_aplicativo\\\\cermont_aplicativo\\\\frontend\\\\public\\\\icons";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg") && f !== "logo-cermont.svg");

const styleBlock = `  <style>
    .cermont-icon {
      overflow: visible;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }
    .cermont-icon:hover {
      transform: scale(1.08);
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    @media (prefers-color-scheme: dark) {
      .cermont-icon:hover {
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.2));
      }
    }
  </style>`;

files.forEach((f) => {
	let content = fs.readFileSync(path.join(dir, f), "utf8");

	// Remove existing cermont-icon classes to avoid duplicates
	content = content.replace(/\bcermont-icon\b/g, "");
	content = content.replace(/class="\s*"/g, "");

	// Add cermont-icon class to svg
	if (content.includes('class="')) {
		content = content.replace(/class="/, 'class="cermont-icon ');
	} else {
		content = content.replace(/<svg /, '<svg class="cermont-icon" ');
	}

	// Remove existing style blocks
	content = content.replace(/<style>[\s\S]*?<\/style>/g, "");

	// Inject style block right after <svg ... >
	content = content.replace(/(<svg[^>]*>)/, `$1\n${styleBlock}`);

	// Fix fill="" or fill="none" on paths where there is no stroke
	content = content.replace(/fill=""/g, 'fill="currentColor"');

	// Replace fill="none" with fill="currentColor" ONLY on <path> tags if there is no stroke
	content = content.replace(/<path([^>]*?)fill="none"([^>]*?)>/g, (match, p1, p2) => {
		if (!p1.includes("stroke=") && !p2.includes("stroke=")) {
			return `<path${p1}fill="currentColor"${p2}>`;
		}
		return match;
	});

	// Also fix camelCase SVG attributes to standard kebab-case if they are there (mostly for standard svg files)
	content = content.replace(/fillRule/g, "fill-rule");
	content = content.replace(/clipRule/g, "clip-rule");

	fs.writeFileSync(path.join(dir, f), content);
});

console.log(`Updated ${files.length} icons.`);
