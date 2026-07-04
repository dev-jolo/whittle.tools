import type { Tool } from "../types";
import { passwordMeta } from "./meta";
import { PasswordGenerator } from "./password";

export const password: Tool = { ...passwordMeta, Component: PasswordGenerator };
