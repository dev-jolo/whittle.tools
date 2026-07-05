import { FIELD_TYPES_BY_ID } from "@/lib/faker-fields";

/**
 * Client-side persistence for the Mock Data Generator. Schemas live in
 * localStorage (separate from the service-worker cache, so deployments never
 * wipe them) and can also be exported to / imported from a JSON file for
 * durable, cross-device backup. Everything is versioned and defensively parsed
 * so a future format change can't break — or crash on — old saves.
 */

export const SCHEMA_FORMAT_VERSION = 1;
const KEY_PREFIX = "whittle:mdg:v1";
const LAST_KEY = `${KEY_PREFIX}:last`;
const SAVED_KEY = `${KEY_PREFIX}:saved`;
const PREFS_KEY = `${KEY_PREFIX}:prefs`;

const VALID_FORMATS = new Set(["json", "csv", "sql", "ts"]);
const MAX_ROWS = 5000;

export interface StoredField {
	name: string;
	typeId: string;
}

/** The full working state of the generator, minus the volatile field keys. */
export interface SchemaConfig {
	fields: StoredField[];
	count: number;
	format: string;
	tableName: string;
	typeName: string;
	constName: string;
}

export interface SavedSchema {
	id: string;
	name: string;
	savedAt: number;
	config: SchemaConfig;
}

export interface GeneratorPrefs {
	/** Whether the periodic "back up your schema" nudge is shown. */
	backupReminder: boolean;
}

export const DEFAULT_PREFS: GeneratorPrefs = { backupReminder: true };

function str(value: unknown, fallback = ""): string {
	return typeof value === "string" ? value : fallback;
}

/**
 * Coerce untrusted data into a valid SchemaConfig, or return null if it isn't
 * recognizably a schema. Unknown field types fall back to UUID; bad values are
 * replaced with sensible defaults rather than rejected.
 */
export function sanitizeConfig(raw: unknown): SchemaConfig | null {
	if (!raw || typeof raw !== "object") return null;
	const obj = raw as Record<string, unknown>;
	if (!Array.isArray(obj.fields)) return null;

	const fields: StoredField[] = obj.fields
		.filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
		.map((f) => {
			const typeId = str(f.typeId);
			return {
				name: str(f.name) || typeId || "field",
				typeId: FIELD_TYPES_BY_ID.has(typeId) ? typeId : "uuid",
			};
		});
	if (fields.length === 0) return null;

	const countRaw = Number(obj.count);
	const count = Number.isFinite(countRaw)
		? Math.min(Math.max(Math.trunc(countRaw), 1), MAX_ROWS)
		: 10;

	const format = VALID_FORMATS.has(str(obj.format)) ? str(obj.format) : "json";

	return {
		fields,
		count,
		format,
		tableName: str(obj.tableName) || "my_table",
		typeName: str(obj.typeName) || "Row",
		constName: str(obj.constName) || "data",
	};
}

/** Serialize a named schema to a portable, self-describing JSON file. */
export function serializeSchemaFile(name: string, config: SchemaConfig): string {
	return JSON.stringify(
		{
			app: "whittle.tools",
			kind: "mock-data-schema",
			version: SCHEMA_FORMAT_VERSION,
			name,
			config,
		},
		null,
		2,
	);
}

/** Parse an imported schema file, tolerating both wrapped and bare configs. */
export function parseSchemaFile(
	text: string,
): { name: string; config: SchemaConfig } | null {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		return null;
	}
	if (!parsed || typeof parsed !== "object") return null;
	const obj = parsed as Record<string, unknown>;

	// Accept a wrapped file ({ config, name }) or a raw config object.
	const configSource = "config" in obj ? obj.config : obj;
	const config = sanitizeConfig(configSource);
	if (!config) return null;

	return { name: str(obj.name) || "Imported schema", config };
}

// --- localStorage side effects (guarded; storage may be unavailable) ---

function read(key: string): unknown {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function write(key: string, value: unknown): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Quota exceeded or storage disabled — fail silently.
	}
}

export function loadLastConfig(): SchemaConfig | null {
	return sanitizeConfig(read(LAST_KEY));
}

export function saveLastConfig(config: SchemaConfig): void {
	write(LAST_KEY, config);
}

export function loadSavedSchemas(): SavedSchema[] {
	const raw = read(SAVED_KEY);
	if (!Array.isArray(raw)) return [];
	return raw
		.map((item): SavedSchema | null => {
			if (!item || typeof item !== "object") return null;
			const obj = item as Record<string, unknown>;
			const config = sanitizeConfig(obj.config);
			if (!config) return null;
			return {
				id: str(obj.id) || newId(),
				name: str(obj.name) || "Untitled schema",
				savedAt: typeof obj.savedAt === "number" ? obj.savedAt : Date.now(),
				config,
			};
		})
		.filter((s): s is SavedSchema => s !== null);
}

/** Save (or overwrite by name) a named schema; returns the updated list. */
export function saveSchema(name: string, config: SchemaConfig): SavedSchema[] {
	const list = loadSavedSchemas();
	const trimmed = name.trim() || "Untitled schema";
	const existing = list.find((s) => s.name === trimmed);
	const entry: SavedSchema = {
		id: existing?.id ?? newId(),
		name: trimmed,
		savedAt: Date.now(),
		config,
	};
	const next = existing
		? list.map((s) => (s.id === existing.id ? entry : s))
		: [...list, entry];
	write(SAVED_KEY, next);
	return next;
}

export function deleteSchema(id: string): SavedSchema[] {
	const next = loadSavedSchemas().filter((s) => s.id !== id);
	write(SAVED_KEY, next);
	return next;
}

export function loadPrefs(): GeneratorPrefs {
	const raw = read(PREFS_KEY);
	if (!raw || typeof raw !== "object") return DEFAULT_PREFS;
	const obj = raw as Record<string, unknown>;
	return {
		backupReminder:
			typeof obj.backupReminder === "boolean"
				? obj.backupReminder
				: DEFAULT_PREFS.backupReminder,
	};
}

export function savePrefs(prefs: GeneratorPrefs): void {
	write(PREFS_KEY, prefs);
}

export function newId(): string {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
