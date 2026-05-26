import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const IMAGE_ROOT = path.resolve(process.cwd(), "frontend/public/images");
const OUTPUT_ROOT = path.join(IMAGE_ROOT, "optimized");
const SOURCE_GROUPS = ["login", "landing"] as const;
const WIDTHS = [640, 960, 1280, 1920] as const;
const FORMATS = ["webp", "avif"] as const;

type SourceGroup = (typeof SOURCE_GROUPS)[number];
type OutputFormat = (typeof FORMATS)[number];

interface ImageVariant {
	width: number;
	format: OutputFormat;
	src: string;
}

interface ImageManifestEntry {
	group: SourceGroup;
	alt: string;
	source: string;
	variants: ImageVariant[];
}

function slugify(filename: string): string {
	return path
		.basename(filename, path.extname(filename))
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function toPublicPath(filePath: string): string {
	return `/${path.relative(path.resolve(process.cwd(), "frontend/public"), filePath).replace(/\\/g, "/")}`;
}

async function optimizeGroup(group: SourceGroup): Promise<ImageManifestEntry[]> {
	const sourceDir = path.join(IMAGE_ROOT, group);
	const outputDir = path.join(OUTPUT_ROOT, group);
	await mkdir(outputDir, { recursive: true });

	const files = (await readdir(sourceDir, { withFileTypes: true }))
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => /\.(png|jpe?g)$/i.test(name));

	const manifestEntries: ImageManifestEntry[] = [];

	for (const file of files) {
		const sourcePath = path.join(sourceDir, file);
		const baseName = slugify(file);
		const variants: ImageVariant[] = [];

		for (const width of WIDTHS) {
			for (const format of FORMATS) {
				const outputPath = path.join(outputDir, `${baseName}-${width}.${format}`);
				await sharp(sourcePath)
					.resize({ width, withoutEnlargement: true })
					.toFormat(format, { quality: format === "avif" ? 52 : 78 })
					.toFile(outputPath);
				variants.push({ width, format, src: toPublicPath(outputPath) });
			}
		}

		manifestEntries.push({
			group,
			alt:
				group === "login"
					? "Operación documental Cermont en campo"
					: "Servicios industriales Cermont con trazabilidad operativa",
			source: toPublicPath(sourcePath),
			variants,
		});
	}

	return manifestEntries;
}

async function main() {
	const entries = (await Promise.all(SOURCE_GROUPS.map((group) => optimizeGroup(group)))).flat();
	await writeFile(
		path.join(IMAGE_ROOT, "manifest.json"),
		`${JSON.stringify(
			{
				generatedAt: new Date().toISOString(),
				note: "Original PNG files remain in /images/login and /images/landing. Optimized variants are generated under /images/optimized.",
				images: entries,
			},
			null,
			2,
		)}\n`,
		"utf8",
	);
}

main();
