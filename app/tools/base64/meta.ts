import { Binary } from "lucide-react";

import type { ToolMeta } from "../types";

export const base64Meta: ToolMeta = {
	slug: "base64",
	name: "Base64 Encode / Decode",
	aliases: [
		"base64 encode",
		"base64 decode",
		"base 64",
		"b64",
		"base64 converter",
	],
	tagline: "Encode text to Base64 or decode it back.",
	description:
		"Convert text to Base64 and back, instantly and correctly for any language — full UTF-8 support, not just ASCII. Flip between encode and decode, switch to the URL-safe alphabet when you need it, and get a clear error the moment the input isn't valid Base64. Runs entirely in your browser.",
	keywords: [
		"base64 encode",
		"base64 decode",
		"base64 converter",
		"base64 to text",
		"text to base64",
		"url-safe base64",
		"decode base64 online",
	],
	category: "encoding",
	icon: Binary,
	status: "stable",
};
