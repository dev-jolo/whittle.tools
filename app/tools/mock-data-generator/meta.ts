import { Table2 } from "lucide-react";

import type { ToolMeta } from "../types";

export const mockDataGeneratorMeta: ToolMeta = {
	slug: "mock-data-generator",
	name: "Mock Data Generator",
	aliases: [
		"test data generator",
		"seed data",
		"database seeder",
		"fake dataset",
		"sample data",
		"mockaroo alternative",
	],
	tagline: "Build a schema and export realistic rows as JSON, CSV, SQL, or TS.",
	description:
		"Design a schema field by field, choose from dozens of realistic types (name, email, address, price, dates, UUIDs, and more), then generate as many rows as you need and export to JSON, CSV, SQL INSERTs, or a typed TypeScript array. No sign-up, no row caps, and nothing leaves your browser — a private, unlimited alternative to Mockaroo for seeding databases and tests.",
	keywords: [
		"mock data generator",
		"test data generator",
		"database seeder",
		"sql insert generator",
		"csv generator",
		"json generator",
		"mockaroo alternative",
		"seed data",
	],
	category: "generator",
	icon: Table2,
	status: "stable",
};
