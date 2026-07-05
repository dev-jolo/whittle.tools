import type { Tool } from "../types";
import { LineUtilities } from "./line-utilities";
import { lineUtilitiesMeta } from "./meta";

export const lineUtilities: Tool = {
	...lineUtilitiesMeta,
	Component: LineUtilities,
};
