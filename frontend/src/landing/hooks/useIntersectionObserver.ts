import { useCallback, useEffect, useState } from "react";

interface UseIntersectionObserverOptions {
	threshold?: number;
	rootMargin?: string;
}

export function useIntersectionObserver(
	options: UseIntersectionObserverOptions = {},
): [React.RefCallback<HTMLDivElement>, boolean] {
	const { threshold = 0.1, rootMargin = "0px" } = options;
	const [isVisible, setIsVisible] = useState(false);
	const [target, setTarget] = useState<HTMLDivElement | null>(null);

	const refCallback = useCallback<React.RefCallback<HTMLDivElement>>((node) => {
		setTarget(node);
	}, []);

	useEffect(() => {
		if (!target || isVisible) {
			return;
		}
		if (typeof IntersectionObserver === "undefined") {
			setIsVisible(true);
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold, rootMargin },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [isVisible, rootMargin, target, threshold]);

	return [refCallback, isVisible];
}
