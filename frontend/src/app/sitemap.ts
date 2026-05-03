import type { MetadataRoute } from "next";
import { validateEnv } from "@/_shared/lib/env-validator";

const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
	const { NEXT_PUBLIC_APP_URL } = validateEnv();
	const baseUrl = NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
	const lastModified = BUILD_TIME;

	return [
		{
			url: baseUrl,
			lastModified,
			changeFrequency: "yearly",
			priority: 1,
		},
		{
			url: `${baseUrl}/login`,
			lastModified,
			changeFrequency: "monthly",
			priority: 0.8,
		},
	];
}
