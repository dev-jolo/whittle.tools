import { ArrowRightLeft } from "lucide-react";

import type { ToolMeta } from "../types";

export const dataConverterMeta: ToolMeta = {
	slug: "data-converter",
	name: "JSON ↔ CSV ↔ YAML",
	aliases: [
		"json to csv",
		"csv to json",
		"json to yaml",
		"yaml to json",
		"csv to yaml",
		"data converter",
		"convert json",
	],
	tagline: "Convert data between JSON, CSV, and YAML.",
	description:
		"Paste JSON, CSV, or YAML and convert it to any of the other two, live. Handles quoted CSV fields, nested values, and arrays of records, with a clear error when the shape doesn't fit the target format. Pick your source and target, or swap directions in a click. Runs entirely in your browser.",
	keywords: [
		"json to csv",
		"csv to json",
		"json to yaml",
		"yaml to json",
		"csv to yaml",
		"data format converter",
		"convert json csv yaml",
	],
	category: "data",
	icon: ArrowRightLeft,
	status: "stable",
};
