interface SSLConfig {
    key: string;
    cert: string;
    passphrase?: string;
    ca?: string;
}
export declare const getSSLConfig: () => Promise<SSLConfig | null>;
export declare const generateDevCert: (outputDir?: string, days?: number) => Promise<void>;
export default getSSLConfig;
//# sourceMappingURL=ssl.d.ts.map