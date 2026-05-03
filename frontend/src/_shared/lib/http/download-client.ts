import { toApiUrl } from "./api-client";

type DownloadMethod = "GET" | "POST";
type DownloadBody = Record<string, string | readonly string[]>;

interface BinaryDownloadOptions {
	path: string;
	filename: string;
	fallbackMessage: string;
	method?: DownloadMethod;
	body?: DownloadBody;
}

interface DownloadErrorBody {
	message?: string;
	error?: string;
}

async function readDownloadErrorMessage(response: Response, fallback: string): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as DownloadErrorBody;
	return body.message || body.error || fallback;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

export async function requestBinaryDownload({
	path,
	filename,
	fallbackMessage,
	method = "GET",
	body,
}: BinaryDownloadOptions): Promise<void> {
	const hasBody = Boolean(body);
	const response = await fetch(toApiUrl(path), {
		...(hasBody ? { body: JSON.stringify(body) } : {}),
		credentials: "include",
		...(hasBody ? { headers: { "Content-Type": "application/json" } } : {}),
		method,
	});

	if (!response.ok) {
		throw new Error(await readDownloadErrorMessage(response, fallbackMessage));
	}

	triggerBrowserDownload(await response.blob(), filename);
}
