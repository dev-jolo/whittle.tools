import type { Tool } from "../types";
import { LoremIpsum } from "./lorem-ipsum";
import { loremIpsumMeta } from "./meta";

export const loremIpsum: Tool = { ...loremIpsumMeta, Component: LoremIpsum };
