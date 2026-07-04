import type { CodecMode, CodecResult } from "../shared/codec-panel";

export interface UrlOptions {
	/**
	 * When true, treat the input as a whole URL and preserve reserved characters
	 * (encodeURI / decodeURI). When false, escape everything (encodeURIComponent
	 * / decodeURIComponent) — the right choice for a single query value.
	 */
	wholeUrl: boolean;
}

export const DEFAULT_OPTIONS: UrlOptions = {
	wholeUrl: false,
};

/**
 * Percent-encode or decode text. Pure and dependency-free; runs client-side.
 * Decoding surfaces a friendly error for malformed escapes like a lone "%".
 */
export function urlCodec(
	input: string,
	mode: CodecMode,
	options: UrlOptions,
): CodecResult {
	if (input === "") return { ok: true, output: "" };

	try {
		if (mode === "encode") {
			const output = options.wholeUrl
				? encodeURI(input)
				: encodeURIComponent(input);
			return { ok: true, output };
		}
		const output = options.wholeUrl
			? decodeURI(input)
			: decodeURIComponent(input);
		return { ok: true, output };
	} catch {
		return {
			ok: false,
			output: "",
			error:
				mode === "decode"
					? "Malformed percent-encoding (e.g. a stray % or bad %XX sequence)."
					: "Couldn't encode this input.",
		};
	}
}
