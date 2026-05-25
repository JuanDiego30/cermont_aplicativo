const { execFileSync } = require("node:child_process");
const { readFileSync, statSync } = require("node:fs");
const { extname } = require("node:path");

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
	encoding: "utf8",
})
	.split("\0")
	.filter(Boolean);

const forbiddenFilePatterns = [/^\.env($|\.)/, /(^|\/)secrets\/.*\.(pem|key)$/i];
const ignoredExtensions = new Set([
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".ico",
	".pdf",
	".woff",
	".woff2",
	".ttf",
	".svg",
	".zip",
	".gz",
	".mp4",
]);

const secretPatterns = [
	{
		name: "private-key",
		regex: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/,
	},
	{
		name: "github-token",
		regex: /gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{40,}/,
	},
	{
		name: "aws-access-key",
		regex: /AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}/,
	},
	{
		name: "slack-token",
		regex: /xox[baprs]-[A-Za-z0-9-]{10,}/,
	},
	{
		name: "stripe-live-key",
		regex: /sk_live_[A-Za-z0-9]{16,}/,
	},
];

const violations = [];

for (const filePath of trackedFiles) {
	if (forbiddenFilePatterns.some((pattern) => pattern.test(filePath))) {
		violations.push({ filePath, reason: "forbidden-file" });
		continue;
	}

	const extension = extname(filePath).toLowerCase();
	if (ignoredExtensions.has(extension)) {
		continue;
	}

	let stats;
	try {
		stats = statSync(filePath);
	} catch {
		continue;
	}

	if (!stats.isFile() || stats.size > 1024 * 1024) {
		continue;
	}

	const content = readFileSync(filePath, "utf8");
	for (const pattern of secretPatterns) {
		if (pattern.regex.test(content)) {
			violations.push({ filePath, reason: pattern.name });
		}
	}
}

if (violations.length > 0) {
	console.error("Secret check failed. Potential sensitive content found:");
	for (const violation of violations) {
		console.error(`- ${violation.filePath} (${violation.reason})`);
	}
	process.exit(1);
}

console.log("Secret check passed.");
