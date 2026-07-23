"use client";

import { useEffect, useMemo, useState } from "react";

type DateInput = Date | string | number;

function useStableOpts(
  opts: Intl.DateTimeFormatOptions,
  timeZone: string,
): Intl.DateTimeFormatOptions {
  return useMemo(() => ({ ...opts, timeZone }), [opts, timeZone]);
}

/**
 * A hook that returns a locale-formatted date string only after mount.
 *
 * During SSR it returns "" (empty string) to avoid hydration mismatches
 * between the server's UTC-based locale output and the client's
 * timezone-aware output.
 *
 * @param input - Date, ISO string, or timestamp
 * @param opts - Intl.DateTimeFormatOptions (defaults to dateStyle: "medium")
 * @param locale - Locale string (defaults to "es-CO" for Colombia)
 * @param timeZone - IANA timezone (defaults to "America/Bogota")
 * @returns Formatted date string (empty string during SSR)
 */
export function useFormattedDate(
  input: DateInput,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  locale = "es-CO",
  timeZone: string = "America/Bogota",
): string {
  const [text, setText] = useState<string>("");
  const merged = useStableOpts(opts, timeZone);

  useEffect(() => {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) {
      setText("");
      return;
    }
    setText(d.toLocaleDateString(locale, merged));
  }, [input, locale, merged]);

	return text;
}

export function useRelativeTime(input: DateInput): string {
	const [text, setText] = useState<string>("");

	useEffect(() => {
		const update = () => {
			const date = input instanceof Date ? input : new Date(input);
			const elapsed = Date.now() - date.getTime();
			if (Number.isNaN(date.getTime()) || elapsed < 0) {
				setText("");
				return;
			}
			const minutes = Math.floor(elapsed / 60_000);
			if (minutes < 1) {
				setText("hace un momento");
				return;
			}
			if (minutes < 60) {
				setText(`hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
				return;
			}
			const hours = Math.floor(minutes / 60);
			if (hours < 24) {
				setText(`hace ${hours} ${hours === 1 ? "hora" : "horas"}`);
				return;
			}
			const days = Math.floor(hours / 24);
			setText(`hace ${days} ${days === 1 ? "día" : "días"}`);
		};

		update();
		const interval = window.setInterval(update, 60_000);
		return () => window.clearInterval(interval);
	}, [input]);

	return text;
}

