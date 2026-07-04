import { KeyRound } from "lucide-react";

import type { ToolMeta } from "../types";

export const jwtDecoderMeta: ToolMeta = {
	slug: "jwt-decoder",
	name: "JWT Decoder",
	aliases: [
		"jwt decode",
		"json web token",
		"decode jwt",
		"jwt parser",
		"jwt viewer",
	],
	tagline: "Decode a JSON Web Token to read its header and payload.",
	description:
		"Paste a JWT to instantly see its header and payload as readable JSON, with issued/expiry times spelled out and an at-a-glance valid or expired status. The signature is shown but never verified — decoding happens entirely in your browser, so tokens never leave your device.",
	keywords: [
		"jwt decoder",
		"jwt decode",
		"json web token",
		"decode jwt online",
		"jwt parser",
		"read jwt payload",
		"jwt viewer",
	],
	category: "encoding",
	icon: KeyRound,
	status: "stable",
};
