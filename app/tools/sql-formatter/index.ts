import type { Tool } from "../types";
import { sqlFormatterMeta } from "./meta";
import { SqlFormatter } from "./sql-formatter";

export const sqlFormatter: Tool = {
	...sqlFormatterMeta,
	Component: SqlFormatter,
};
