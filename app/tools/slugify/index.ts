import type { Tool } from "../types";
import { slugifyMeta } from "./meta";
import { Slugify } from "./slugify";

export const slugify: Tool = {
	...slugifyMeta,
	Component: Slugify,
};
