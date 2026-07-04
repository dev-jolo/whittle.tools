import { Clock } from "lucide-react";

import type { ToolMeta } from "../types";

export const timestampMeta: ToolMeta = {
	slug: "timestamp",
	name: "Timestamp Converter",
	aliases: [
		"unix timestamp",
		"epoch converter",
		"unix time",
		"epoch to date",
		"date to epoch",
		"unix to human",
	],
	tagline: "Convert Unix time to a human date, and back.",
	description:
		"Paste a Unix timestamp — seconds or milliseconds, auto-detected — or a date, and see it as epoch seconds, milliseconds, ISO 8601, a readable date in any time zone, and relative time. Hit Now for the current moment. Everything is computed in your browser.",
	keywords: [
		"unix timestamp converter",
		"epoch converter",
		"unix time to date",
		"date to epoch",
		"timestamp to human",
		"iso 8601",
		"epoch milliseconds",
	],
	category: "converter",
	icon: Clock,
	status: "stable",
};
