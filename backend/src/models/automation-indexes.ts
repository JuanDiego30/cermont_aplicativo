import { AutomationExecution } from "./AutomationExecution";
import { AutomationOperationalAction } from "./AutomationOperationalAction";
import { AutomationRule } from "./AutomationRule";

/**
 * Production disables Mongoose auto-indexing. Automation idempotency depends
 * on the unique execution and action dedupe indexes, so bootstrap must ensure
 * those indexes exist before the API starts accepting events.
 */
export async function ensureAutomationIndexes(): Promise<void> {
	await Promise.all([
		AutomationRule.createCollection(),
		AutomationExecution.createCollection(),
		AutomationOperationalAction.createCollection(),
	]);
	await Promise.all([
		AutomationRule.createIndexes(),
		AutomationExecution.createIndexes(),
		AutomationOperationalAction.createIndexes(),
	]);
}
