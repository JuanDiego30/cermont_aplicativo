import { connect, disconnect } from "mongoose";
import { env } from "./src/config/env";
import { getServiceCases } from "./src/modules/service-cases/service-case.service";

async function run() {
	try {
		await connect(env.MONGODB_URI);
		console.log("Connected to DB. Calling getServiceCases...");
		const result = await getServiceCases({ page: 1, limit: 50 });
		console.log("Result:", result.total);
	} catch (err) {
		console.error("ERROR CAUGHT:");
		console.error(err);
	} finally {
		await disconnect();
	}
}

run();
