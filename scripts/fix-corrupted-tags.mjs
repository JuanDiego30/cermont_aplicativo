import fs from "node:fs";
import path from "node:path";

const filesToCheck = [
	"frontend/src/app/(dashboard)/orders/[id]/inspections/[inspectionId]/page.tsx",
	"frontend/src/app/(dashboard)/catalog/templates/page.tsx",
	"frontend/src/app/(dashboard)/proposals/[id]/page.tsx",
	"frontend/src/app/(dashboard)/proposals/new/page.tsx",
	"frontend/src/app/(dashboard)/orders/new/page.tsx",
	"frontend/src/app/(dashboard)/work-requests/new/page.tsx",
	"frontend/src/app/(dashboard)/templates/[id]/import/xlsx/page.tsx",
	"frontend/src/app/(dashboard)/templates/[id]/import/pdf/page.tsx",
	"frontend/src/app/(dashboard)/resources/[id]/page.tsx",
	"frontend/src/app/(dashboard)/reports/[id]/page.tsx",
	"frontend/src/app/(dashboard)/maintenance/[id]/page.tsx",
	"frontend/src/app/(dashboard)/admin/users/[id]/page.tsx",
	"frontend/src/app/(dashboard)/orders/[id]/edit/page.tsx",
	"frontend/src/app/(dashboard)/files/page.tsx",
];

let fixedCount = 0;

for (const file of filesToCheck) {
	const fullPath = path.join(process.cwd(), file);
	if (!fs.existsSync(fullPath)) {
		console.log(`SKIP (not found): ${file}`);
		continue;
	}

	let content = fs.readFileSync(fullPath, "utf8");
	const original = content;

	// Fix pattern 1: -semibold...>text</h1> or -semibold...>text</h2> etc (missing opening tag)
	// Match lines that start with whitespace then -semibold (missing <h1 className="font or <h2 className="font)
	const missingOpenPattern = /^(\s+)-semibold(.*?>)(.*?)(<\/h[1-6]>)/gm;
	content = content.replace(missingOpenPattern, (_match, indent, attrs, text, closeTag) => {
		const tag = closeTag.replace("</", "").replace(">", ""); // e.g. h1, h2
		// Try to reconstruct the font size class based on context
		// Default to text-xl for h1, text-lg for h2, text-base for h3
		const sizeClass = tag === "h1" ? "text-xl" : tag === "h2" ? "text-lg" : "text-base";
		return `${indent}<${tag} className="${sizeClass} font-semibold${attrs}${text}${closeTag}`;
	});

	// Fix pattern 2: className="...">">  (stray "> at end)
	const strayClosePattern = /className="([^"]*)">">/g;
	content = content.replace(strayClosePattern, 'className="$1">');

	// Fix pattern 3: className="..."">  (stray " at end)
	const strayQuotePattern = /className="([^"]*)"">/g;
	content = content.replace(strayQuotePattern, 'className="$1">');

	// Fix pattern 4: -semibold text-...">text</h1> (missing opening tag with specific text)
	const missingOpenAltPattern = /^(\s+)-semibold\s+text-/gm;
	content = content.replace(missingOpenAltPattern, (_match, indent) => {
		return `${indent}<h1 className="font-semibold text-`;
	});

	if (content !== original) {
		fs.writeFileSync(fullPath, content, "utf8");
		fixedCount++;
		console.log(`FIXED: ${file}`);
	} else {
		console.log(`OK (no changes): ${file}`);
	}
}

console.log(`\nTotal files fixed: ${fixedCount}`);
