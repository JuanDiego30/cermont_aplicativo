const jwt = require("jsonwebtoken");
const _env = require("dotenv").config({
	path: "C:/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo/backend/.env",
});
const http = require("node:http");

const SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET (first 20 chars):", `${SECRET?.substring(0, 20)}...`);

// Create a valid token
const token = jwt.sign(
	{ _id: "507f1f77bcf86cd799439011", role: "gerente", email: "admin@cermont.com" },
	SECRET,
);
console.log("Generated token:", `${token.substring(0, 50)}...`);

// Verify it works
try {
	const decoded = jwt.verify(token, SECRET);
	console.log("Token verified successfully:", JSON.stringify(decoded));
} catch (e) {
	console.error("Token verification failed:", e.message);
}

// Test endpoints
const endpoints = [
	"/api/users",
	"/api/orders?limit=5&pagination=cursor",
	"/api/analytics/kpis",
	"/api/maintenance/kits?limit=100",
	"/api/resources",
	"/api/proposals?limit=20",
	"/api/documents",
];

console.log("\nTesting endpoints with valid token...\n");

let completed = 0;
endpoints.forEach((path) => {
	const options = {
		hostname: "127.0.0.1",
		port: 5000,
		path: path,
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	};

	const req = http.request(options, (res) => {
		let data = "";
		res.on("data", (chunk) => {
			data += chunk;
		});
		res.on("end", () => {
			const status = res.statusCode;
			const _isJson = data.length > 0 && data[0] === "{";
			let body = data;
			try {
				body = JSON.parse(data);
			} catch (_e) {}

			console.log(`${status} ${path}`);
			if (status !== 200) {
				console.log("  Error:", JSON.stringify(body).substring(0, 200));
			} else {
				console.log("  Success!");
			}

			completed++;
			if (completed === endpoints.length) {
				console.log("\nAll tests completed.");
			}
		});
	});

	req.on("error", (e) => {
		console.error(`Error calling ${path}:`, e.message);
		completed++;
	});

	req.end();
});
