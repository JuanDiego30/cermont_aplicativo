import type { NextFunction, Request, RequestHandler, Response } from "express";

interface DeprecatedRouteOptions {
	successor: string;
	sunset: string;
}

export function deprecatedRoute({ successor, sunset }: DeprecatedRouteOptions): RequestHandler {
	return (_req: Request, res: Response, next: NextFunction) => {
		res.setHeader("Deprecation", "true");
		res.setHeader("Sunset", sunset);
		res.setHeader("Link", `<${successor}>; rel="successor-version"`);
		next();
	};
}
