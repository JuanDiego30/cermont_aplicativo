import bcrypt from "bcryptjs";
import mongoose from "mongoose";

async function seedDemoData(): Promise<void> {
	await mongoose.connect("mongodb://127.0.0.1:27017/cermont");
	console.log("Connected to MongoDB");

	const User = mongoose.model("User");
	const salt = await bcrypt.genSalt(10);
	const password = await bcrypt.hash("Demo1234!", salt);

	const users = [
		{
			name: "Gerente Demo",
			email: "gerente@cermont.com",
			password,
			role: "gerente",
			isActive: true,
		},
		{
			name: "Residente Demo",
			email: "residente@cermont.com",
			password,
			role: "residente",
			isActive: true,
		},
		{ name: "HES Demo", email: "hes@cermont.com", password, role: "hes", isActive: true },
		{
			name: "Supervisor Demo",
			email: "supervisor@cermont.com",
			password,
			role: "supervisor",
			isActive: true,
		},
		{
			name: "Operador Demo",
			email: "operador@cermont.com",
			password,
			role: "operador",
			isActive: true,
		},
		{
			name: "Tecnico Demo",
			email: "tecnico@cermont.com",
			password,
			role: "tecnico",
			isActive: true,
		},
		{
			name: "Admin Demo",
			email: "admin@cermont.com",
			password,
			role: "administrativo",
			isActive: true,
		},
		{
			name: "Cliente Demo",
			email: "cliente@cermont.com",
			password,
			role: "cliente",
			isActive: true,
		},
	];

	for (const u of users) {
		const existing = await User.findOne({ email: u.email });
		if (!existing) {
			await User.create(u);
			console.log(`Created user: ${u.email}`);
		}
	}

	const Client = mongoose.model("Client");
	const clients = [
		{
			name: "SIERRACOL Energy",
			nit: "900123456-7",
			email: "facturas@sierracol.com",
			phone: "+57 1 2345678",
		},
		{
			name: "Ecopetrol S.A.",
			nit: "899999001-1",
			email: "facturas@ecopetrol.com",
			phone: "+57 1 2345679",
		},
		{
			name: "Constructora ABC",
			nit: "900789012-3",
			email: "info@constructoraabc.com",
			phone: "+57 4 5678901",
		},
	];

	for (const c of clients) {
		const existing = await Client.findOne({ nit: c.nit });
		if (!existing) {
			await Client.create(c);
			console.log(`Created client: ${c.name}`);
		}
	}

	const Order = mongoose.model("Order");
	const ServiceCase = mongoose.model("ServiceCase");
	const workStatuses = ["open", "assigned", "in_progress", "completed", "closed"];
	const orderTypes = [
		{ title: "Mantenimiento CCTV Torre 5A", type: "cctv_maintenance" },
		{ title: "Instalación línea de vida vertical", type: "safety_line" },
		{ title: "Mantenimiento eléctrico subestación", type: "electrical" },
		{ title: "Montaje de equipos de refrigeración", type: "refrigeration" },
		{ title: "Inspección de redes de telecomunicaciones", type: "telecom" },
	];

	for (let i = 0; i < 10; i++) {
		const sc = await ServiceCase.create({
			code: `SC-2026-${String(i + 1).padStart(3, "0")}`,
			title: orderTypes[i % orderTypes.length].title,
			status: "open",
			currentStep: Math.floor(Math.random() * 8) + 1,
			createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
		});

		await Order.create({
			code: `ORD-2026-${String(i + 1).padStart(3, "0")}`,
			serviceCaseId: sc._id,
			title: sc.title,
			status: workStatuses[i % workStatuses.length],
			type: orderTypes[i % orderTypes.length].type,
			estimatedCostCOP: Math.floor(Math.random() * 50000000) + 5000000,
			createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
		});
	}

	console.log(
		`Created ${users.length} users, ${clients.length} clients, 10 service cases and 10 orders`,
	);
	await mongoose.disconnect();
}

seedDemoData().catch(console.error);
