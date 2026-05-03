const CHALLENGE_TTL_MS = 5 * 60 * 1000;

interface ChallengeEntry {
	challenge: string;
	expiresAt: number;
}

const registrationChallenges = new Map<string, ChallengeEntry>();
const authenticationChallenges = new Map<string, ChallengeEntry>();

function isExpired(entry: ChallengeEntry | undefined): boolean {
	return !entry || entry.expiresAt <= Date.now();
}

function pruneExpired(map: Map<string, ChallengeEntry>): void {
	const now = Date.now();
	for (const [key, entry] of map.entries()) {
		if (entry.expiresAt <= now) {
			map.delete(key);
		}
	}
}

export function rememberRegistrationChallenge(userId: string, challenge: string): void {
	pruneExpired(registrationChallenges);
	registrationChallenges.set(userId, {
		challenge,
		expiresAt: Date.now() + CHALLENGE_TTL_MS,
	});
}

export function consumeRegistrationChallenge(userId: string): string | null {
	const entry = registrationChallenges.get(userId);
	registrationChallenges.delete(userId);
	if (!entry || isExpired(entry)) {
		return null;
	}
	return entry.challenge;
}

export function rememberAuthenticationChallenge(challenge: string): void {
	pruneExpired(authenticationChallenges);
	authenticationChallenges.set(challenge, {
		challenge,
		expiresAt: Date.now() + CHALLENGE_TTL_MS,
	});
}

export function consumeAuthenticationChallenge(challenge: string): boolean {
	const entry = authenticationChallenges.get(challenge);
	authenticationChallenges.delete(challenge);
	return !isExpired(entry);
}
