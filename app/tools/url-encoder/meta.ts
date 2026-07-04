import { Link } from "lucide-react";

import type { ToolMeta } from "../types";

export const urlEncoderMeta: ToolMeta = {
	slug: "url-encoder",
	name: "URL Encode / Decode",
	aliases: [
		"url encode",
		"url decode",
		"percent encoding",
		"uri encode",
		"urlencode",
	],
	tagline: "Percent-encode text for URLs, or decode it back.",
	description:
		"Escape text so it's safe to drop into a URL, or decode a percent-encoded string back to readable text. Defaults to encoding a single value (encodeURIComponent); switch to whole-URL mode to keep :/?&= intact. Malformed input gets a clear error. All local to your browser.",
	keywords: [
		"url encode",
		"url decode",
		"percent encoding",
		"uri component encode",
		"urlencode online",
		"decode url",
		"query string encoder",
	],
	category: "encoding",
	icon: Link,
	status: "stable",
};
