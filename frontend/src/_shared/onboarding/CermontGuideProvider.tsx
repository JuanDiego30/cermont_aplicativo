"use client";

import { type Driver, driver } from "driver.js";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { useOnboardingStore } from "./onboarding.store";
import { type CermontTour, getTourForPath } from "./tours";

export const CERMONT_GUIDE_EVENT = "cermont:start-guide";

function hasVisibleTarget(selector: string): boolean {
	const element = document.querySelector(selector);
	if (!element) {
		return false;
	}
	const rect = element.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0;
}

function filterAvailableSteps(steps: CermontTour["steps"]): CermontTour["steps"] {
	return steps.filter((step) => {
		if (!step.element || typeof step.element !== "string") {
			return true;
		}
		if (step.element.includes(",")) {
			return step.element.split(",").some((selector) => hasVisibleTarget(selector.trim()));
		}
		return hasVisibleTarget(step.element);
	});
}

export function CermontGuideProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname() ?? "";
	const driverRef = useRef<Driver | false>(false);
	const seenTours = useOnboardingStore((state) => state.seenTours);
	const markSeen = useOnboardingStore((state) => state.markSeen);
	const markSkipped = useOnboardingStore((state) => state.markSkipped);
	const resetTour = useOnboardingStore((state) => state.resetTour);

	const startTour = useCallback(
		(force = false) => {
			const tour = getTourForPath(pathname);
			if (!tour) {
				return;
			}
			if (!force && seenTours[tour.id]) {
				return;
			}

			const steps = filterAvailableSteps(tour.steps);
			if (steps.length === 0) {
				return;
			}

			if (driverRef.current) {
				driverRef.current.destroy();
			}
			driverRef.current = driver({
				steps,
				animate: true,
				smoothScroll: true,
				stagePadding: 8,
				stageRadius: 8,
				overlayOpacity: 0.52,
				popoverClass: "cermont-guide-popover",
				showProgress: true,
				nextBtnText: "Next",
				prevBtnText: "Back",
				doneBtnText: "Got it",
				onDestroyed: () => markSeen(tour.id),
				onCloseClick: (_element, _step, { driver: activeDriver }) => {
					markSkipped(tour.id);
					activeDriver.destroy();
				},
			});
			driverRef.current.drive();
		},
		[markSeen, markSkipped, pathname, seenTours],
	);

	useEffect(() => {
		const timeout = window.setTimeout(() => startTour(false), 700);
		return () => window.clearTimeout(timeout);
	}, [startTour]);

	useEffect(() => {
		function handleGuideEvent() {
			const tour = getTourForPath(pathname);
			if (tour) {
				resetTour(tour.id);
			}
			window.setTimeout(() => startTour(true), 80);
		}

		window.addEventListener(CERMONT_GUIDE_EVENT, handleGuideEvent);
		return () => window.removeEventListener(CERMONT_GUIDE_EVENT, handleGuideEvent);
	}, [pathname, resetTour, startTour]);

	useEffect(() => {
		return () => {
			if (driverRef.current) {
				driverRef.current.destroy();
			}
		};
	}, []);

	return <>{children}</>;
}
