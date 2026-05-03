// Extend Multer File type to include custom fields
declare namespace Express {
	namespace Multer {
		interface File {
			storedPath?: string;
			filename?: string;
		}
	}
}
