import { Dices } from "lucide-react";

import type { ToolMeta } from "../types";

export const fakeValueMeta: ToolMeta = {
	slug: "fake-value",
	name: "Fake Value Generator",
	aliases: [
		"random data",
		"fake email",
		"fake name",
		"test value",
		"dummy value",
		"sample data",
	],
	tagline: "Grab a single realistic fake value — name, email, UUID, and more.",
	description:
		"Need one believable test value? Pick a type — full name, email, address, IBAN, credit card, UUID, lorem, and dozens more — and get a fresh value you can copy in a click. Reroll as many times as you like. Powered by Faker, running entirely in your browser with no sign-up and no limits.",
	keywords: [
		"fake data generator",
		"random value generator",
		"fake email generator",
		"fake name generator",
		"test data",
		"dummy data",
	],
	category: "generator",
	icon: Dices,
	status: "stable",
};
