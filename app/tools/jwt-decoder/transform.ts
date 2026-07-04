export interface JwtResult {
	ok: boolean;
	error?: string;
	/** Pretty-printed JSON of the decoded header. */
	header?: string;
	/** Pretty-printed JSON of the decoded payload. */
	payload?: string;
	/** The raw signature segment (not verified — that needs the secret/key). */
	signature?: string;
	/** Standard time claims, in seconds since the epoch, when present. */
	exp?: number;
	iat?: number;
	nbf?: number;
}

/** Decode a Base64URL segment to a UTF-8 string. Throws on invalid input. */
function decodeSegment(segment: string): string {
	let normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
	const remainder = normalized.length % 4;
	if (remainder) normalized += "=".repeat(4 - remainder);
	const binary = atob(normalized);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder(undefined, { fatal: true }).decode(bytes);
}

function numberClaim(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined;
}

/**
 * Decode a JWT into its header and payload without verifying the signature
 * (verification needs the signing secret/key, which isn't the job here). Pure
 * and dependency-free; runs entirely client-side.
 */
export function decodeJwt(input: string): JwtResult {
	const token = input.trim();
	if (token === "") return { ok: true };

	const parts = token.split(".");
	if (parts.length < 2) {
		return {
			ok: false,
			error: "This doesn't look like a JWT — expected header.payload.signature.",
		};
	}

	let header: unknown;
	let payload: unknown;
	try {
		header = JSON.parse(decodeSegment(parts[0]));
	} catch {
		return { ok: false, error: "The header isn't valid Base64URL-encoded JSON." };
	}
	try {
		payload = JSON.parse(decodeSegment(parts[1]));
	} catch {
		return { ok: false, error: "The payload isn't valid Base64URL-encoded JSON." };
	}

	const claims = (payload ?? {}) as Record<string, unknown>;
	return {
		ok: true,
		header: JSON.stringify(header, null, 2),
		payload: JSON.stringify(payload, null, 2),
		signature: parts[2] ?? "",
		exp: numberClaim(claims.exp),
		iat: numberClaim(claims.iat),
		nbf: numberClaim(claims.nbf),
	};
}
