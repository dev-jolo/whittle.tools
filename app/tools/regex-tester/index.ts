import type { Tool } from "../types";
import { regexTesterMeta } from "./meta";
import { RegexTester } from "./regex-tester";

export const regexTester: Tool = {
	...regexTesterMeta,
	Component: RegexTester,
};
