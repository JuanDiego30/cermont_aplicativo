import fs from "node:fs";
import path from "node:path";

const files = [
	"frontend/src/app/(dashboard)/admin/custom-fields/page.tsx",
	"frontend/src/app/(dashboard)/admin/tariffs/page.tsx",
	"frontend/src/app/(dashboard)/admin/users/error.tsx",
	"frontend/src/app/(dashboard)/admin/users/new/page.tsx",
	"frontend/src/app/(dashboard)/admin/users/page.tsx",
	"frontend/src/app/(dashboard)/catalog/checklists/[id]/page.tsx",
	"frontend/src/app/(dashboard)/costs/error.tsx",
	"frontend/src/app/(dashboard)/costs/page.tsx",
	"frontend/src/app/(dashboard)/history/page.tsx",
	"frontend/src/app/(dashboard)/orders/[id]/edit/page.tsx",
	"frontend/src/app/(dashboard)/orders/error.tsx",
	"frontend/src/app/(dashboard)/orders/kanban/page.tsx",
	"frontend/src/app/(dashboard)/proposals/[id]/page.tsx",
	"frontend/src/app/(dashboard)/reports/[id]/page.tsx",
	"frontend/src/app/(dashboard)/reports/archive/page.tsx",
	"frontend/src/app/(dashboard)/resources/[id]/page.tsx",
	"frontend/src/app/(dashboard)/resources/page.tsx",
];

let fixedCount = 0;

for (const file of files) {
	const fullPath = path.join(process.cwd(), file);
	if (!fs.existsSync(fullPath)) {
		console.log(`SKIP (not found): ${file}`);
		continue;
	}

	let content = fs.readFileSync(fullPath, "utf8");
	const original = content;

	// Fix pattern 1: className="...">"> → className="...">"
	content = content.replace(/className="([^"]*)">">/g, 'className="$1">');

	// Fix pattern 2: className="...""> → className="...">"
	content = content.replace(/className="([^"]*)">"/g, 'className="$1">');

	// Fix pattern 3: className="..."" → className="...""
	content = content.replace(/className="([^"]*)"">/g, 'className="$1">');

	// Fix pattern 4: -semibold...>text</h1> (missing opening tag)
	// Match lines that have -semibold followed by attrs and closing h1/h2/h3
	content = content.replace(
		/^(\s+)-semibold(\s+[^>]*?>)(.*?)(<\/h[1-6]>)/gm,
		(_match, indent, attrs, text, closeTag) => {
			const tag = closeTag.replace(/<\//g, "").replace(/>/g, "");
			const sizeClass = tag === "h1" ? "text-xl" : tag === "h2" ? "text-lg" : "text-base";
			return `${indent}<${tag} className="${sizeClass} font-semibold${attrs}${text}${closeTag}`;
		},
	);

	// Fix pattern 5: className="... font-semibold">"> → className="... font-semibold">"
	content = content.replace(/className="([^"]*)">">/g, 'className="$1">');

	// Fix pattern 6: className="... font-semibold""> → className="... font-semibold">"
	content = content.replace(/className="([^"]*)">"/g, 'className="$1">');

	if (content !== original) {
		fs.writeFileSync(fullPath, content, "utf8");
		fixedCount++;
		console.log(`FIXED: ${file}`);
	} else {
		console.log(`OK (no changes): ${file}`);
	}
}

console.log(`\nTotal files fixed: ${fixedCount}`);
