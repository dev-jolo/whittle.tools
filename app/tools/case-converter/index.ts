import type { Tool } from "../types";
import { CaseConverter } from "./case-converter";
import { caseConverterMeta } from "./meta";

export const caseConverter: Tool = {
	...caseConverterMeta,
	Component: CaseConverter,
};
