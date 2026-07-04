import type { Tool } from "../types";
import { JsonFormatter } from "./json-formatter";
import { jsonFormatterMeta } from "./meta";

export const jsonFormatter: Tool = {
	...jsonFormatterMeta,
	Component: JsonFormatter,
};
