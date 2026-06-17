/**
 * Type declarations for the BarcodeDetector API
 * https://wicg.github.io/shape-detection-api/
 * Supported in Chromium-based browsers (Chrome, Edge, Opera, Samsung Internet)
 */

interface BarcodeDetectorOptions {
	formats: BarcodeFormat[];
}

type BarcodeFormat =
	| "aztec"
	| "code_128"
	| "code_39"
	| "code_93"
	| "codabar"
	| "data_matrix"
	| "ean_13"
	| "ean_8"
	| "itf"
	| "pdf417"
	| "qr_code"
	| "upc_a"
	| "upc_e"
	| "micro_qr_code";

interface DetectedBarcode {
	rawValue: string;
	boundingBox: DOMRectReadOnly;
	format: BarcodeFormat;
	cornerPoints: readonly Readonly<{ x: number; y: number }>[];
}

declare class BarcodeDetector {
	constructor(options?: BarcodeDetectorOptions);
	static getSupportedFormats(): Promise<BarcodeFormat[]>;
	detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

declare global {
	interface Window {
		BarcodeDetector?: typeof BarcodeDetector;
	}
}

export {};
