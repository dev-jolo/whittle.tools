import type { Tool } from "../types";
import { ColorConverter } from "./color-converter";
import { colorConverterMeta } from "./meta";

export const colorConverter: Tool = {
	...colorConverterMeta,
	Component: ColorConverter,
};
