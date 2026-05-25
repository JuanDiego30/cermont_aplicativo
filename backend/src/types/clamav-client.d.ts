declare module "clamav-client" {
	interface ClamAVScanner {
		init(options: {
			clamdscan: {
				host: string;
				port: number;
				localFallback: boolean;
			};
		}): Promise<void>;
		scanBuffer(buffer: Buffer): Promise<{ isInfected: boolean }>;
	}

	const ClamAVClient: {
		new (): ClamAVScanner;
	};

	export default ClamAVClient;
}
