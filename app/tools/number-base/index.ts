import type { Tool } from "../types";
import { numberBaseMeta } from "./meta";
import { NumberBaseConverter } from "./number-base";

export const numberBase: Tool = {
	...numberBaseMeta,
	Component: NumberBaseConverter,
};
