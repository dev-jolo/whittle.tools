import type { Tool } from "../types";
import { FakeValue } from "./fake-value";
import { fakeValueMeta } from "./meta";

export const fakeValue: Tool = {
	...fakeValueMeta,
	Component: FakeValue,
};
