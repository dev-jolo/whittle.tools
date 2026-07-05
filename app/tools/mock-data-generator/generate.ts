import type { Faker } from "@faker-js/faker";

import { type FieldValue, getFieldType } from "@/lib/faker-fields";

export interface SchemaField {
	/** Stable id for React keys and editing (not part of the output). */
	key: string;
	/** Column / property name in the generated output. */
	name: string;
	/** Field type id from the catalog. */
	typeId: string;
}

export type Row = Record<string, FieldValue>;

/**
 * Generate `count` rows for the given schema. Seeding Faker makes the output
 * deterministic for a seed, so live re-renders don't reshuffle the data; the
 * UI bumps the seed to reroll. The Faker instance is injected so this module
 * has no runtime dependency on faker.
 */
export function generateRows(
	fields: SchemaField[],
	count: number,
	faker: Faker,
	seed: number,
): Row[] {
	faker.seed(seed);
	const rows: Row[] = [];
	for (let i = 0; i < count; i++) {
		const row: Row = {};
		for (const field of fields) {
			row[field.name] = getFieldType(field.typeId).generate(faker, i);
		}
		rows.push(row);
	}
	return rows;
}

/**
 * Give each field a unique output name, suffixing collisions (`email`,
 * `email_2`, …) so object/CSV/SQL output never silently drops a column.
 */
export function withUniqueNames(fields: SchemaField[]): SchemaField[] {
	const seen = new Map<string, number>();
	return fields.map((field) => {
		const base = field.name.trim() || field.typeId;
		const count = seen.get(base) ?? 0;
		seen.set(base, count + 1);
		return count === 0 ? { ...field, name: base } : { ...field, name: `${base}_${count + 1}` };
	});
}
