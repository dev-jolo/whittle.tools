import type { Tool } from "../types";
import { DataConverter } from "./data-converter";
import { dataConverterMeta } from "./meta";

export const dataConverter: Tool = {
	...dataConverterMeta,
	Component: DataConverter,
};
