import type { UserDocument, WebAuthnCredentialDocument } from "@cermont/shared-types";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IUserRepository } from "../domain/user.repository";
import { User } from "./model";

type UserDbShape = Omit<UserDocument, "_id"> & {
	_id: string | { toString(): string };
	toObject?: () => Omit<UserDbShape, "toObject">;
};

type PasswordComparable = {
	comparePassword: (plainPassword: string) => Promise<boolean>;
};

type Savable = {
	save: () => Promise<UserDbShape>;
};

function toUserDocument(doc: UserDbShape): UserDocument {
	const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;

	return {
		...plain,
		_id: plain._id.toString(),
	};
}

function hasComparePassword(user: unknown): user is PasswordComparable {
	return typeof (user as { comparePassword?: unknown }).comparePassword === "function";
}

function hasSaveMethod(user: unknown): user is Savable {
	return typeof (user as { save?: unknown }).save === "function";
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export class UserRepository implements IUserRepository {
	async findById(id: string): Promise<UserDocument | null> {
		const doc = await User.findById(id);
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async findOne(filter: Record<string, unknown>): Promise<UserDocument | null> {
		const doc = await User.findOne(filter);
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<UserDocument[]> {
		let query = User.find(filter);
		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}
		const docs = await query;
		return docs.map((doc) => toUserDocument(doc as UserDbShape));
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return User.countDocuments(filter);
	}

	async create(data: Partial<UserDocument>): Promise<UserDocument> {
		const doc = await User.create(data as Record<string, unknown>);
		return toUserDocument(doc as UserDbShape);
	}

	async update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
		const doc = await User.findByIdAndUpdate(id, data as Record<string, unknown>, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async delete(id: string): Promise<boolean> {
		const result = await User.findByIdAndDelete(id);
		return result !== null;
	}

	async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
		const doc = await User.findOne({ email: normalizeEmail(email) }).select("+password");
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async findByEmail(email: string): Promise<UserDocument | null> {
		const doc = await User.findOne({ email: normalizeEmail(email) }).lean();
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async findByIdWithPassword(id: string): Promise<UserDocument | null> {
		const doc = await User.findById(id).select("+password");
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async findByIdLean(id: string): Promise<UserDocument | null> {
		const doc = await User.findById(id).lean();
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async findByWebAuthnCredentialId(credentialId: string): Promise<UserDocument | null> {
		const doc = await User.findOne({ "webAuthnCredentials.credentialId": credentialId }).lean();
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
			select?: string;
		},
	): Promise<UserDocument[]> {
		let query = User.find(filter);

		if (options.select) {
			query = query.select(options.select);
		}

		if (options.sort) {
			query = query.sort(options.sort);
		}

		query = query.skip(options.skip).limit(options.limit);
		const docs = await query.lean();
		return docs.map((doc) => toUserDocument(doc as UserDbShape));
	}

	async verifyPassword(user: UserDocument, plainPassword: string): Promise<boolean> {
		if (!hasComparePassword(user)) {
			const doc = await User.findById(user._id).select("+password");
			if (!doc || !hasComparePassword(doc)) {
				return false;
			}
			return doc.comparePassword(plainPassword);
		}
		return user.comparePassword(plainPassword);
	}

	async findByResetToken(token: string): Promise<UserDocument | null> {
		const doc = await User.findOne({
			resetToken: token,
			resetTokenExpires: { $gt: new Date() },
		}).select("+password +resetToken +resetTokenExpires");
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async save(user: UserDocument): Promise<UserDocument> {
		if (hasSaveMethod(user)) {
			const savedDoc = await user.save();
			return toUserDocument(savedDoc);
		}
		const doc = await User.findById(user._id);
		if (!doc) {
			throw new Error("User not found for saving");
		}
		Object.assign(doc, user);
		if (!hasSaveMethod(doc)) {
			throw new Error("Loaded user document does not expose save()");
		}
		const savedDoc = await doc.save();
		return toUserDocument(savedDoc as UserDbShape);
	}

	async addWebAuthnCredential(
		userId: string,
		credential: WebAuthnCredentialDocument,
	): Promise<UserDocument | null> {
		const doc = await User.findByIdAndUpdate(
			userId,
			{ $push: { webAuthnCredentials: credential } },
			{ returnDocument: "after", runValidators: true },
		).lean();
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}

	async updateWebAuthnCredentialCounter(
		credentialId: string,
		counter: number,
		lastUsedAt: Date,
	): Promise<void> {
		await User.updateOne(
			{ "webAuthnCredentials.credentialId": credentialId },
			{
				$set: {
					"webAuthnCredentials.$.counter": counter,
					"webAuthnCredentials.$.lastUsedAt": lastUsedAt,
				},
			},
		);
	}

	async deleteWebAuthnCredential(
		userId: string,
		credentialId: string,
	): Promise<UserDocument | null> {
		const doc = await User.findByIdAndUpdate(
			userId,
			{ $pull: { webAuthnCredentials: { credentialId } } },
			{ returnDocument: "after" },
		).lean();
		return doc ? toUserDocument(doc as UserDbShape) : null;
	}
}
