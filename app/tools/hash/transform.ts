import { md5 } from "./md5";

export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

export const HASH_ALGORITHMS: HashAlgorithm[] = [
	"MD5",
	"SHA-1",
	"SHA-256",
	"SHA-512",
];

function toHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

async function subtleHash(
	algorithm: "SHA-1" | "SHA-256" | "SHA-512",
	text: string,
): Promise<string> {
	const data = new TextEncoder().encode(text);
	const digest = await crypto.subtle.digest(algorithm, data);
	return toHex(digest);
}

/** Compute a single hash (hex). MD5 is synchronous; SHA-* use Web Crypto. */
export async function computeHash(
	algorithm: HashAlgorithm,
	text: string,
): Promise<string> {
	if (algorithm === "MD5") return md5(text);
	return subtleHash(algorithm, text);
}

/** Compute every supported hash of `text`, in display order. */
export async function computeHashes(
	text: string,
): Promise<Record<HashAlgorithm, string>> {
	const [sha1, sha256, sha512] = await Promise.all([
		subtleHash("SHA-1", text),
		subtleHash("SHA-256", text),
		subtleHash("SHA-512", text),
	]);
	return { MD5: md5(text), "SHA-1": sha1, "SHA-256": sha256, "SHA-512": sha512 };
}
