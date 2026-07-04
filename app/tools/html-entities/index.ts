import type { Tool } from "../types";
import { HtmlEntities } from "./html-entities";
import { htmlEntitiesMeta } from "./meta";

export const htmlEntities: Tool = {
	...htmlEntitiesMeta,
	Component: HtmlEntities,
};
