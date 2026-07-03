import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export type ToolCategory = "text" | "data" | "encoding";

export type ToolStatus = "stable" | "beta";

/** Static, serializable description of a tool. Safe to import anywhere. */
export interface ToolMeta {
	/** URL segment, e.g. "splitter" -> /tools/splitter */
	slug: string;
	name: string;
	/** Alternate names people search for (surfaced in search + keywords). */
	aliases?: string[];
	/** One-liner shown on cards and hover cards. */
	tagline: string;
	/** Longer copy used for the tool page intro and the SEO description. */
	description: string;
	keywords: string[];
	category: ToolCategory;
	icon: LucideIcon;
	status: ToolStatus;
}

/** A tool's metadata paired with its React implementation. */
export interface Tool extends ToolMeta {
	Component: ComponentType;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
	text: "Text",
	data: "Data",
	encoding: "Encoding",
};
