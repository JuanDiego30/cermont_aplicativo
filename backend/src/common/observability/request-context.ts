import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
	requestId: string;
	ipAddress: string;
	userAgent: string;
}

export type RequestContextState =
	| { status: "available"; context: RequestContext }
	| { status: "unavailable" };

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
	return requestContextStorage.run(context, callback);
}

export function getRequestContext(): RequestContextState {
	const context = requestContextStorage.getStore();
	return context ? { status: "available", context } : { status: "unavailable" };
}
