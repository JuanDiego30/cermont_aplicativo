import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const rootDir = path.resolve(__dirname, "..");
const svgSource = path.join(rootDir, "docs", "logo.svg");
const outputDir = path.join(rootDir, "frontend", "public", "icons");

async function generate() {
	console.log(`Starting PWA asset generation...`);
	console.log(`Source SVG: ${svgSource}`);
	console.log(`Output Directory: ${outputDir}`);

	if (!fs.existsSync(svgSource)) {
		console.error(`Error: Source SVG not found at ${svgSource}`);
		process.exit(1);
	}

	if (!fs.existsSync(outputDir)) {
		console.log(`Creating output directory...`);
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const sourceBuffer = fs.readFileSync(svgSource);

	// 1. icon-192.png
	console.log(`Generating icon-192.png...`);
	await sharp(sourceBuffer).resize(192, 192).png().toFile(path.join(outputDir, "icon-192.png"));

	// 2. icon-512.png
	console.log(`Generating icon-512.png...`);
	await sharp(sourceBuffer).resize(512, 512).png().toFile(path.join(outputDir, "icon-512.png"));

	// 3. maskable-icon-192.png (with safe-zone layout padding on white background)
	console.log(`Generating maskable-icon-192.png...`);
	const maskable192Logo = await sharp(sourceBuffer).resize(130, 130).png().toBuffer();

	await sharp({
		create: {
			width: 192,
			height: 192,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 1 },
		},
	})
		.composite([{ input: maskable192Logo, gravity: "center" }])
		.png()
		.toFile(path.join(outputDir, "maskable-icon-192.png"));

	// 4. maskable-icon-512.png (with safe-zone layout padding on white background)
	console.log(`Generating maskable-icon-512.png...`);
	const maskable512Logo = await sharp(sourceBuffer).resize(348, 348).png().toBuffer();

	await sharp({
		create: {
			width: 512,
			height: 512,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 1 },
		},
	})
		.composite([{ input: maskable512Logo, gravity: "center" }])
		.png()
		.toFile(path.join(outputDir, "maskable-icon-512.png"));

	// 5. logo-cermont.png
	console.log(`Generating logo-cermont.png...`);
	await sharp(sourceBuffer).resize(512, 512).png().toFile(path.join(outputDir, "logo-cermont.png"));

	// 6. favicon.png
	console.log(`Generating favicon.png...`);
	await sharp(sourceBuffer)
		.resize(32, 32)
		.png()
		.toFile(path.join(rootDir, "frontend", "public", "favicon.png"));

	console.log(`PWA assets generated successfully!`);
}

generate().catch((err) => {
	console.error(`PWA asset generation failed:`, err);
	process.exit(1);
});
