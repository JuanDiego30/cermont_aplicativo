import type { UserDocument, WebAuthnCredentialDocument } from "@cermont/shared-types";
import type { IRepository, SortDirection } from "../../_shared/common/interfaces/repository";

export interface IUserRepository extends IRepository<UserDocument> {
	/** Find user by email with password field included (for authentication). Returns Mongoose document. */
	findByEmailWithPassword(email: string): Promise<UserDocument | null>;

	/** Find user by email (read-only, no password). Returns plain object. */
	findByEmail(email: string): Promise<UserDocument | null>;

	/** Find user by ID with password field included (for password change). Returns Mongoose document. */
	findByIdWithPassword(id: string): Promise<UserDocument | null>;

	/** Find user by ID as a plain object (read-only). */
	findByIdLean(id: string): Promise<UserDocument | null>;

	/** Find user by a registered WebAuthn credential ID. */
	findByWebAuthnCredentialId(credentialId: string): Promise<UserDocument | null>;

	/** Paginated user listing with optional filters and field selection. */
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
			select?: string;
		},
	): Promise<UserDocument[]>;

	/** Verify plaintext password against the stored hash. Requires document with password. */
	verifyPassword(user: UserDocument, plainPassword: string): Promise<boolean>;

	/** Find user by reset token that has not expired. Returns Mongoose document. */
	findByResetToken(token: string): Promise<UserDocument | null>;

	/** Persist changes to an existing user document. */
	save(user: UserDocument): Promise<UserDocument>;

	/** Append a passkey credential to a user. */
	addWebAuthnCredential(
		userId: string,
		credential: WebAuthnCredentialDocument,
	): Promise<UserDocument | null>;

	/** Update a passkey counter after a successful assertion. */
	updateWebAuthnCredentialCounter(
		credentialId: string,
		counter: number,
		lastUsedAt: Date,
	): Promise<void>;

	/** Remove a passkey credential from a user. */
	deleteWebAuthnCredential(userId: string, credentialId: string): Promise<UserDocument | null>;

	/** Count documents matching the filter. */
	countDocuments(filter: Record<string, unknown>): Promise<number>;
}
