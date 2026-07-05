import type { Tool } from "../types";
import { MockDataGenerator } from "./mock-data-generator";
import { mockDataGeneratorMeta } from "./meta";

export const mockDataGenerator: Tool = {
	...mockDataGeneratorMeta,
	Component: MockDataGenerator,
};
