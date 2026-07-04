import { Hash } from "lucide-react";

import type { ToolMeta } from "../types";

export const numberBaseMeta: ToolMeta = {
	slug: "number-base",
	name: "Number Base Converter",
	aliases: [
		"hex to decimal",
		"decimal to hex",
		"binary to decimal",
		"hex to binary",
		"base converter",
		"radix converter",
	],
	tagline: "Convert between hex, decimal, binary, and octal.",
	description:
		"Type a number in any base — decimal, hexadecimal, octal, or binary — and see it in the others instantly. Edit whichever field you like; the rest keep up. Handles arbitrarily large values and negatives, with a clear flag when a digit doesn't belong to the base. All local to your browser.",
	keywords: [
		"hex to decimal",
		"decimal to hex",
		"binary to decimal",
		"decimal to binary",
		"base converter",
		"radix converter",
		"number base converter",
	],
	category: "converter",
	icon: Hash,
	status: "stable",
};
