import { IdCard } from "lucide-react";

import type { ToolMeta } from "../types";

export const uuidMeta: ToolMeta = {
	slug: "uuid",
	name: "UUID Generator",
	aliases: ["guid generator", "uuid v4", "uuid v7", "generate uuid", "guid"],
	tagline: "Generate random or time-ordered UUIDs.",
	description:
		"Generate UUIDs in bulk — classic random v4 or time-ordered v7 for sortable database keys. Choose how many, toggle uppercase and hyphens, and copy them all at once. Generated with your browser's secure random source; nothing is sent anywhere.",
	keywords: [
		"uuid generator",
		"guid generator",
		"uuid v4",
		"uuid v7",
		"generate uuid",
		"random uuid",
		"unique id generator",
	],
	category: "generator",
	icon: IdCard,
	status: "stable",
};
