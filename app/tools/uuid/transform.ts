export type UuidVersion = "v4" | "v7";

export interface UuidFormat {
	uppercase: boolean;
	hyphens: boolean;
}

const hex: string[] = Array.from({ length: 256 }, (_, i) =>
	i.toString(16).padStart(2, "0"),
);

/** Format 16 bytes as a canonical hyphenated UUID string. */
function bytesToUuid(bytes: Uint8Array): string {
	const h = Array.from(bytes, (b) => hex[b]);
	return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
}

/** Random UUIDv4 via the platform CSPRNG. */
export function uuidV4(): string {
	if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	return bytesToUuid(bytes);
}

/**
 * Time-ordered UUIDv7: a 48-bit Unix-ms timestamp followed by random bits, so
 * generated ids sort chronologically. Great for database keys.
 */
export function uuidV7(nowMs: number = Date.now()): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	const timestamp = BigInt(nowMs);
	for (let i = 0; i < 6; i++) {
		bytes[i] = Number((timestamp >> BigInt(8 * (5 - i))) & 0xffn);
	}
	bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
	bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
	return bytesToUuid(bytes);
}

export function generateUuids(version: UuidVersion, count: number): string[] {
	const safeCount = Math.max(1, Math.min(1000, Math.floor(count) || 1));
	const make = version === "v7" ? uuidV7 : uuidV4;
	return Array.from({ length: safeCount }, () => make());
}

/** Apply display formatting (case, hyphens) to a canonical UUID string. */
export function formatUuid(uuid: string, format: UuidFormat): string {
	let out = uuid;
	if (!format.hyphens) out = out.replace(/-/g, "");
	if (format.uppercase) out = out.toUpperCase();
	return out;
}
