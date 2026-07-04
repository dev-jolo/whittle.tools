import type { CodecMode, CodecResult } from "../shared/codec-panel";

export interface Base64Options {
	/** Use the URL-safe alphabet (-_ instead of +/) and drop padding. */
	urlSafe: boolean;
}

export const DEFAULT_OPTIONS: Base64Options = {
	urlSafe: false,
};

function bytesToBinary(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return binary;
}

/**
 * Encode or decode Base64, UTF-8 safe (btoa/atob only handle Latin-1, so we go
 * through TextEncoder/TextDecoder). Pure and dependency-free; runs client-side.
 */
export function base64(
	input: string,
	mode: CodecMode,
	options: Base64Options,
): CodecResult {
	if (input === "") return { ok: true, output: "" };

	if (mode === "encode") {
		const binary = bytesToBinary(new TextEncoder().encode(input));
		let output = btoa(binary);
		if (options.urlSafe) {
			output = output.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
		}
		return { ok: true, output };
	}

	// Decode: accept either alphabet, strip whitespace, and re-pad.
	let normalized = input.trim().replace(/\s+/g, "");
	normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
	const remainder = normalized.length % 4;
	if (remainder) normalized += "=".repeat(4 - remainder);

	try {
		const binary = atob(normalized);
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		const output = new TextDecoder().decode(bytes);
		return { ok: true, output };
	} catch {
		return { ok: false, output: "", error: "That isn't valid Base64." };
	}
}
