import QRCode from "qrcode";
import { createLogger } from "../../common/utils/logger";

const log = createLogger("qr-service");

export async function generateQrCode(
	entityType: string,
	entityId: string,
	label?: string,
): Promise<{
	entityType: string;
	entityId: string;
	code: string;
	imageDataUrl: string;
	label?: string;
}> {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.cermont.com.co";
	const url = `${baseUrl}/qr/${entityType}/${entityId}`;

	const imageDataUrl = await QRCode.toDataURL(url, {
		width: 300,
		margin: 2,
		color: { dark: "#2154A6", light: "#FFFFFF" },
	});

	log.info("QR code generated", { entityType, entityId });

	return { entityType, entityId, code: url, imageDataUrl, label };
}

export async function generateBulkQrCodes(
	items: Array<{ entityType: string; entityId: string; label?: string }>,
): Promise<
	Array<{
		entityType: string;
		entityId: string;
		code: string;
		imageDataUrl: string;
		label?: string;
	}>
> {
	return Promise.all(
		items.map((item) => generateQrCode(item.entityType, item.entityId, item.label)),
	);
}
