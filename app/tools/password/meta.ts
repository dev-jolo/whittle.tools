import { KeySquare } from "lucide-react";

import type { ToolMeta } from "../types";

export const passwordMeta: ToolMeta = {
	slug: "password",
	name: "Password Generator",
	aliases: [
		"random password",
		"password generator",
		"random string",
		"strong password",
		"passphrase",
	],
	tagline: "Generate strong, random passwords.",
	description:
		"Create strong random passwords with the length and character types you choose — lowercase, uppercase, digits, and symbols — and optionally skip look-alike characters. Every password is guaranteed to use each selected type, with a live entropy estimate. Generated with your browser's secure random source; nothing is sent anywhere.",
	keywords: [
		"password generator",
		"random password",
		"strong password generator",
		"random string generator",
		"secure password",
		"passphrase generator",
	],
	category: "generator",
	icon: KeySquare,
	status: "stable",
};
