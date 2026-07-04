import type { Tool } from "../types";
import { uuidMeta } from "./meta";
import { UuidGenerator } from "./uuid";

export const uuid: Tool = { ...uuidMeta, Component: UuidGenerator };
