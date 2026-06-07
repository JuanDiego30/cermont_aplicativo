export const MOTION = {
	surface: "motion-surface",
	card: "motion-card",
	button: "motion-button",
	press: "motion-press",
	overlay: "motion-overlay",
	panel: "motion-panel",
	drawer: "motion-drawer",
	modal: "motion-modal",
	input: "motion-input",
	reveal: "motion-reveal",
	revealUp: "motion-reveal-up",
	lift: "motion-hover-lift",
	listItem: "motion-list-item",
	listItemStagger: "motion-stagger-item",
	subtle: "motion-subtle",
} as const;

export type MotionClassName = (typeof MOTION)[keyof typeof MOTION];
