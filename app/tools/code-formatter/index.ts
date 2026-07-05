import type { Tool } from "../types";
import { CodeFormatter } from "./code-formatter";
import { codeFormatterMeta } from "./meta";

export const codeFormatter: Tool = {
	...codeFormatterMeta,
	Component: CodeFormatter,
};
