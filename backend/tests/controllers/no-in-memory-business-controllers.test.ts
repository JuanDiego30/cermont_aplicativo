import fs from "node:fs";
import path from "node:path";

describe("business controllers persistence boundary", () => {
	type ControllerEntry = { file: string; subdir: string };
	const controllerFiles: ControllerEntry[] = [
		{ file: "document-import.controller.ts", subdir: "modules/documents" },
		{ file: "document-template.controller.ts", subdir: "modules/documents" },
		{ file: "kit-document.controller.ts", subdir: "modules/resource" },
		{ file: "resource-document.controller.ts", subdir: "modules/resource" },
	];

	it.each(controllerFiles)("does not keep business state in memory: %s", ({ file, subdir }) => {
		const filePath = path.resolve(process.cwd(), "src", subdir, file);
		const source = fs.readFileSync(filePath, "utf8");

		expect(source).not.toMatch(/\bnew Map\b|Map</);
	});
});
