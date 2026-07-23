import { expect, test } from "@playwright/test";

const LANDING_VIEWPORTS = [
	{ width: 320, height: 800 },
	{ width: 375, height: 812 },
	{ width: 390, height: 844 },
	{ width: 768, height: 1024 },
	{ width: 1280, height: 900 },
	{ width: 1440, height: 900 },
] as const;

for (const viewport of LANDING_VIEWPORTS) {
	test(`landing completes the public journey at ${viewport.width}px`, async ({
		page,
	}, testInfo) => {
		const consoleErrors: string[] = [];
		const pageErrors: string[] = [];

		page.on("console", (message) => {
			if (message.type() === "error") {
				consoleErrors.push(message.text());
			}
		});
		page.on("pageerror", (error) => pageErrors.push(error.message));

		await page.setViewportSize(viewport);
		await page.goto("/", { waitUntil: "networkidle" });

		await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
		await expect(page.getByRole("heading", { level: 1 })).toContainText("cada paso");
		await expect(page.locator("footer")).toBeAttached();
		await expect(page.getByRole("link", { name: "Acceso privado" }).first()).toHaveAttribute(
			"href",
			"/login",
		);

		await page.locator("#inicio").getByRole("link", { name: "Ver servicios", exact: true }).click();
		await expect(page).toHaveURL(/#servicios$/);
		await page.getByRole("link", { name: "Solicitar información", exact: true }).first().click();
		await expect(page).toHaveURL(/#contacto$/);

		const hasNoHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth <= window.innerWidth,
		);
		expect(hasNoHorizontalOverflow).toBe(true);

		await page.evaluate(() =>
			window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" }),
		);
		await expect(page.locator("footer")).toBeInViewport();
		await page.screenshot({
			path: testInfo.outputPath(`landing-${viewport.width}.png`),
			fullPage: false,
		});

		expect(
			pageErrors,
			`Page errors at ${viewport.width}px:\n${pageErrors.join("\n")}`,
		).toHaveLength(0);
		expect(
			consoleErrors,
			`Console errors at ${viewport.width}px:\n${consoleErrors.join("\n")}`,
		).toHaveLength(0);
	});
}

test("mobile navigation supports focus, Escape, anchors, and closes after navigation", async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto("/", { waitUntil: "networkidle" });

	const trigger = page.locator('button[aria-controls="landing-mobile-nav"]');
	await trigger.click();
	const mobileNav = page.getByRole("navigation", { name: "Navegación móvil" });
	await expect(mobileNav).toBeVisible();
	await expect(trigger).toHaveAttribute("aria-expanded", "true");
	await expect(mobileNav.getByRole("link", { name: "Inicio", exact: true })).toBeFocused();

	await page.keyboard.press("Escape");
	await expect(trigger).toBeFocused();
	await expect(mobileNav).toBeHidden();

	await trigger.click();
	await mobileNav.getByRole("link", { name: "Servicios", exact: true }).click();
	await expect(page).toHaveURL(/#servicios$/);
	await expect(trigger).toBeVisible();
});

test("theme and reduced motion controls are observable", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
	await page.goto("/", { waitUntil: "networkidle" });

	await expect(page.getByRole("button", { name: /Cambiar tema/ }).first()).toBeVisible();
	await expect(page.getByRole("button", { name: /Cambiar tema/ }).first()).toHaveAttribute(
		"title",
		/Actual:/,
	);
	const reducedMotion = await page.evaluate(
		() => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	);
	expect(reducedMotion).toBe(true);

	const themeButton = page.getByRole("button", { name: /Cambiar tema/ }).first();
	await themeButton.click();
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await themeButton.click();
	await expect(page.locator("html")).toHaveClass(/dark/);
});
