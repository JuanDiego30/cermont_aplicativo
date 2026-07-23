import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PublicLandingContent } from "@/landing/components/PublicLandingContent";
import { WhatsAppFAB } from "@/landing/components/WhatsAppFAB";
import { MethodSection } from "@/landing/components/MethodSection";
import { ServiceCard } from "@/landing/components/cards/ServiceCard";
import { PrincipleCard } from "@/landing/components/cards/PrincipleCard";
import { ResourceCard } from "@/landing/components/cards/ResourceCard";

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/image", () => ({
	default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
		<span role="img" aria-label={alt} data-src={src} className={className} />
	),
}));

vi.mock("@/core/ui/ThemeToggle", () => ({
	ThemeToggle: () => (
		<button type="button" aria-label="Cambiar tema">
			Tema
		</button>
	),
}));

describe("PublicLandingContent", () => {
	it("renders the documented section order with one h1", () => {
		const { container } = render(<PublicLandingContent />);
		const headings = Array.from(container.querySelectorAll("h1, h2")).map((heading) =>
			heading.textContent?.trim(),
		);

		expect(container.querySelectorAll("h1")).toHaveLength(1);
		expect(headings[0]).toContain("Ingeniería que documenta");
		expect(headings.findIndex((heading) => heading?.includes("Principios"))).toBeGreaterThan(0);
		expect(headings.findIndex((heading) => heading?.includes("Cómo conectamos el trabajo"))).toBeGreaterThan(
			headings.findIndex((heading) => heading?.includes("Principios")),
		);
		expect(headings.at(-1)).toContain("Conversemos sobre su próximo servicio");
	});

	it("keeps public anchors valid and routes private access to login", () => {
		const { container } = render(<PublicLandingContent />);
		const anchorLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));

		for (const link of anchorLinks) {
			expect(container.querySelector(link.getAttribute("href") ?? "")).not.toBeNull();
		}

		expect(container.querySelectorAll('a[href="/login"]')).not.toHaveLength(0);
	});

	it("does not render empty testimonials or NIT as a metric", () => {
		const { container } = render(<PublicLandingContent />);

		expect(screen.queryByText(/testimonios/i)).not.toBeInTheDocument();
		expect(container.querySelectorAll("[data-metric]")).toHaveLength(0);
		expect(container.querySelector("#inicio")?.textContent).not.toMatch(/NIT/i);
		expect(container.querySelector('[aria-labelledby="trust-heading"]')?.textContent).not.toMatch(
			/NIT/i,
		);
	});

	it("exposes descriptive images and actionable direct contact channels", () => {
		const { container } = render(<PublicLandingContent />);
		const images = Array.from(container.querySelectorAll('[role="img"]'));

		expect(images.length).toBeGreaterThan(0);
		for (const image of images) {
			expect(image.getAttribute("aria-label")?.trim()).not.toBe("");
		}

		expect(container.querySelector('a[href^="mailto:"]')).not.toBeNull();
		expect(container.querySelectorAll('a[href^="tel:"]').length).toBeGreaterThan(0);
		expect(container.querySelector('a[href^="https://wa.me/"]')).toHaveAttribute(
			"rel",
			"noopener noreferrer",
		);
	});

	it("does not render the old FeaturesSection heading", () => {
		render(<PublicLandingContent />);
		expect(screen.queryByText("Lo que nos define como empresa")).not.toBeInTheDocument();
	});

	it("renders the new merged differentiators inside TrustSection", () => {
		const { container } = render(<PublicLandingContent />);
		const trustSection = container.querySelector('[aria-labelledby="trust-heading"]');
		expect(trustSection?.textContent).toContain("Alcance claro");
		expect(trustSection?.textContent).toContain("Cierre documentado");
	});

	it("renders gallery grid with 2 columns for 2 visual assets", () => {
		const { container } = render(<PublicLandingContent />);
		const evidenceSection = container.querySelector('[aria-labelledby="evidence-heading"]');
		const evidenceGrid = evidenceSection?.querySelector(".grid");
		expect(evidenceGrid?.className).toContain("sm:grid-cols-2");
	});

	it("renders WhatsApp FAB with descriptive aria-label", () => {
		const { container } = render(<WhatsAppFAB />);
		const fab = container.querySelector('a[aria-label="Contactar por WhatsApp, abre en nueva pestaña"]');
		expect(fab).not.toBeNull();
		expect(fab?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(fab?.getAttribute("target")).toBe("_blank");
	});

	it("renders service cards with brand-green icon wrapper", () => {
		const { container } = render(
			<ServiceCard
				title="Test Service"
				description="Test description"
				icon={() => <svg />}
			/>,
		);
		const iconWrapper = container.querySelector(".rounded-xl");
		expect(iconWrapper?.className).toContain("bg-brand-green");
	});

	it("renders principle cards with brand-green icon wrapper when icon provided", () => {
		const { container } = render(
			<PrincipleCard
				title="Test Principle"
				description="Test description"
				icon={() => <svg />}
			/>,
		);
		const iconWrapper = container.querySelector(".rounded-xl");
		expect(iconWrapper?.className).toContain("bg-brand-green");
	});

	it("renders resource CTA with brand-green link", () => {
		const { container } = render(
			<ResourceCard
				title="Test Resource"
				description="Test description"
				href="/test"
				meta="Test"
				destination="contact"
			/>,
		);
		const link = container.querySelector("a[href='/test']");
		expect(link?.className).toContain("text-brand-green");
	});

	it("renders method section with connector elements", () => {
		const { container } = render(<MethodSection />);
		const methodSection = container.querySelector('[aria-labelledby="method-heading"]');
		const ariaHiddenDividers = methodSection?.querySelectorAll('[aria-hidden="true"]');
		expect(ariaHiddenDividers?.length).toBeGreaterThan(0);
	});

	it("renders footer with token-based colors instead of hardcoded white", () => {
		const { container } = render(<PublicLandingContent />);
		const footer = container.querySelector("footer");
		expect(footer?.className).toContain("bg-canvas-dark");
		expect(footer?.className).toContain("border-hairline-dark");
	});

	it("opens, closes with Escape, and returns focus in the mobile menu", () => {
		render(<PublicLandingContent />);
		const trigger = screen.getByRole("button", { name: "Abrir menú" });

		fireEvent.click(trigger);
		expect(screen.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute(
			"aria-expanded",
			"true",
		);
		fireEvent.keyDown(document, { key: "Escape" });

		expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus();
	});

	it("includes data-analytics attributes on hero CTAs", () => {
		const { container } = render(<PublicLandingContent />);
		const heroSection = container.querySelector("#inicio");
		const primaryCta = heroSection?.querySelector('[data-analytics="cta-hero-primary"]');
		const secondaryCta = heroSection?.querySelector('[data-analytics="cta-hero-secondary"]');

		expect(primaryCta).not.toBeNull();
		expect(secondaryCta).not.toBeNull();
		expect(primaryCta?.getAttribute("data-analytics-label")).toBe("hero-solicitar-informacion");
	});

	it("includes data-analytics on WhatsApp FAB", () => {
		const { container } = render(<PublicLandingContent />);
		const fab = container.querySelector('[data-analytics-label="whatsapp-fab"]');
		expect(fab).not.toBeNull();
		expect(fab?.getAttribute("data-analytics")).toBe("cta-whatsapp");
	});

	it("includes data-analytics on private access links", () => {
		const { container } = render(<PublicLandingContent />);
		const loginLinks = container.querySelectorAll('[data-analytics="cta-private-access"]');
		expect(loginLinks.length).toBeGreaterThanOrEqual(1);
	});

	it("includes data-analytics on phone links in contact section", () => {
		const { container } = render(<PublicLandingContent />);
		const phoneLinks = container.querySelectorAll('[data-analytics="cta-phone"]');
		expect(phoneLinks.length).toBeGreaterThanOrEqual(1);
	});

	it("renders FAQ section with accessible accordion", () => {
		const { container } = render(<PublicLandingContent />);
		const faqSection = container.querySelector("#preguntas");
		expect(faqSection).not.toBeNull();

		const buttons = faqSection?.querySelectorAll("button[aria-expanded]");
		expect(buttons?.length).toBeGreaterThan(0);
		expect(buttons?.[0]?.getAttribute("data-analytics")).toBe("cta-faq-expand");
	});

	it("FAQ accordion opens and closes on click", () => {
		const { container } = render(<PublicLandingContent />);
		const faqSection = container.querySelector("#preguntas");
		const firstButton = faqSection?.querySelector("button[aria-expanded]");

		expect(firstButton?.getAttribute("aria-expanded")).toBe("false");

		if (firstButton) {
			fireEvent.click(firstButton);
			expect(firstButton.getAttribute("aria-expanded")).toBe("true");

			fireEvent.click(firstButton);
			expect(firstButton.getAttribute("aria-expanded")).toBe("false");
		}
	});

	it("FAQ panel is hidden when not expanded", () => {
		const { container } = render(<PublicLandingContent />);
		const faqSection = container.querySelector("#preguntas");
		const panels = faqSection?.querySelectorAll("dd[hidden]");
		expect(panels?.length).toBeGreaterThan(0);
	});
});
