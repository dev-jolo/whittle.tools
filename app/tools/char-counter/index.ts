import type { Tool } from "../types";
import { CharCounter } from "./char-counter";
import { charCounterMeta } from "./meta";

export const charCounter: Tool = {
	...charCounterMeta,
	Component: CharCounter,
};
