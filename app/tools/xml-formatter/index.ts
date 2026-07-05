import type { Tool } from "../types";
import { xmlFormatterMeta } from "./meta";
import { XmlFormatter } from "./xml-formatter";

export const xmlFormatter: Tool = {
	...xmlFormatterMeta,
	Component: XmlFormatter,
};
