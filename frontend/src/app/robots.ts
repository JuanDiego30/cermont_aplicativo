import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env-validator";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = getEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: new URL("/sitemap.xml", siteUrl).toString(),
	};
}
