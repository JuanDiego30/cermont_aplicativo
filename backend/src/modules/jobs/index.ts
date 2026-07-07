/**
 * Jobs Module — Scheduled expiry and reminder workers
 *
 * Auto-starts the reminder worker when this module is imported.
 */

import { startWorker } from "./jobs.service";

// Auto-start on module import
startWorker();

export { default as jobsRoutes } from "./jobs.routes";
export { runAllChecks, startWorker, stopWorker } from "./jobs.service";
