import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
	end: number;
	duration?: number;
	start?: number;
	enabled?: boolean;
}

export function useCountUp({ end, duration = 2000, start = 0, enabled = true }: UseCountUpOptions) {
	const [value, setValue] = useState(start);
	const frameRef = useRef(0);
	const startTimeRef = useRef(0);

	useEffect(() => {
		if (!enabled) {
			setValue(end);
			return;
		}

		startTimeRef.current = performance.now();

		const animate = (now: number) => {
			const elapsed = now - startTimeRef.current;
			const progress = Math.min(elapsed / duration, 1);
			const easeOut = 1 - (1 - progress) * (1 - progress);
			const current = Math.round(start + (end - start) * easeOut);
			setValue(current);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(animate);
			}
		};

		frameRef.current = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(frameRef.current);
	}, [end, duration, start, enabled]);

	return value;
}
