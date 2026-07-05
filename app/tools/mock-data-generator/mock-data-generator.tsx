import type { Faker } from "@faker-js/faker";
import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	CopyIcon,
	DownloadIcon,
	FileDownIcon,
	FileUpIcon,
	InfoIcon,
	Loader2Icon,
	PlusIcon,
	RefreshCwIcon,
	SaveIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { FieldTypeCombobox } from "@/components/field-type-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	loadLastConfig,
	loadPrefs,
	loadSavedSchemas,
	parseSchemaFile,
	saveLastConfig,
	saveSchema,
	savePrefs,
	deleteSchema,
	type SavedSchema,
	type SchemaConfig,
	serializeSchemaFile,
} from "@/lib/mock-schema-store";
import { useLazyModule } from "@/lib/use-lazy-module";
import { cn } from "@/lib/utils";
import {
	generateRows,
	type SchemaField,
	withUniqueNames,
} from "./generate";
import {
	DEFAULT_SERIALIZE_OPTIONS,
	type ExportFormat,
	serializeRows,
	type SerializeOptions,
} from "./serialize";
import { useBackupNudge } from "./use-backup-nudge";

const MAX_ROWS = 5000;

// Fixed keys so the server and client render the same initial markup (avoids a
// hydration mismatch); user-added fields get a random key client-side.
const DEFAULT_FIELDS: SchemaField[] = [
	{ key: "f-id", name: "id", typeId: "autoIncrement" },
	{ key: "f-name", name: "name", typeId: "fullName" },
	{ key: "f-email", name: "email", typeId: "email" },
	{ key: "f-created", name: "createdAt", typeId: "pastDate" },
];

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
	{ value: "json", label: "JSON" },
	{ value: "csv", label: "CSV" },
	{ value: "sql", label: "SQL INSERT" },
	{ value: "ts", label: "TypeScript" },
];

const FORMAT_META: Record<ExportFormat, { ext: string; mime: string }> = {
	json: { ext: "json", mime: "application/json" },
	csv: { ext: "csv", mime: "text/csv" },
	sql: { ext: "sql", mime: "application/sql" },
	ts: { ext: "ts", mime: "text/plain" },
};

const loadFaker = (): Promise<Faker> =>
	import("@faker-js/faker/locale/en").then((mod) => mod.faker);

function newKey(): string {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `f-${Math.random().toString(36).slice(2)}`;
}

function downloadText(text: string, filename: string, mime: string) {
	const blob = new Blob([text], { type: mime });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

function fileSlug(name: string): string {
	return (
		name
			.trim()
			.replace(/[^a-z0-9]+/gi, "-")
			.replace(/^-+|-+$/g, "")
			.toLowerCase() || "mock-schema"
	);
}

export function MockDataGenerator() {
	const [fields, setFields] = useState<SchemaField[]>(DEFAULT_FIELDS);
	const [count, setCount] = useState(10);
	const [seed, setSeed] = useState(1);
	const [options, setOptions] = useState<SerializeOptions>(
		DEFAULT_SERIALIZE_OPTIONS,
	);

	// Persistence state.
	const [savedList, setSavedList] = useState<SavedSchema[]>([]);
	const [selectedId, setSelectedId] = useState("");
	const [schemaName, setSchemaName] = useState("");
	const [backupReminder, setBackupReminder] = useState(true);
	const [hydrated, setHydrated] = useState(false);
	const [backedUpSig, setBackedUpSig] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const loader = useCallback(loadFaker, []);
	const { module: faker, loading, error: loadError } = useLazyModule(loader);

	const currentConfig: SchemaConfig = useMemo(
		() => ({
			fields: fields.map((f) => ({ name: f.name, typeId: f.typeId })),
			count,
			format: options.format,
			tableName: options.tableName,
			typeName: options.typeName,
			constName: options.constName,
		}),
		[fields, count, options],
	);
	const signature = useMemo(() => JSON.stringify(currentConfig), [currentConfig]);

	const applyConfig = useCallback((config: SchemaConfig) => {
		setFields(
			config.fields.map((f) => ({ key: newKey(), name: f.name, typeId: f.typeId })),
		);
		setCount(config.count);
		setOptions({
			format: config.format as ExportFormat,
			tableName: config.tableName,
			typeName: config.typeName,
			constName: config.constName,
		});
	}, []);

	// One-time restore of prefs, saved schemas, and the last working config.
	useEffect(() => {
		setBackupReminder(loadPrefs().backupReminder);
		setSavedList(loadSavedSchemas());
		const last = loadLastConfig();
		if (last) {
			applyConfig(last);
			setBackedUpSig(JSON.stringify(last));
		} else {
			setBackedUpSig(signature);
		}
		setHydrated(true);
		// Run once on mount; `signature` here is the initial default.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Silently auto-save the working config (debounced) so a refresh or return
	// never loses in-progress work. Separate from the durable file backup.
	useEffect(() => {
		if (!hydrated) return;
		const id = window.setTimeout(() => saveLastConfig(currentConfig), 1000);
		return () => window.clearTimeout(id);
	}, [hydrated, signature, currentConfig]);

	const dirty = hydrated && backedUpSig !== null && signature !== backedUpSig;
	const nudging = useBackupNudge({
		dirty,
		changeKey: signature,
		enabled: backupReminder,
	});

	// Defer the generation inputs so editing stays snappy for thousands of rows.
	const deferredFields = useDeferredValue(fields);
	const deferredCount = useDeferredValue(count);
	const deferredSeed = useDeferredValue(seed);

	const genFields = useMemo(
		() => withUniqueNames(deferredFields),
		[deferredFields],
	);
	const clampedCount = Math.min(Math.max(deferredCount || 0, 0), MAX_ROWS);

	const rows = useMemo(() => {
		if (!faker || genFields.length === 0) return [];
		return generateRows(genFields, clampedCount, faker, deferredSeed);
	}, [faker, genFields, clampedCount, deferredSeed]);

	const output = useMemo(
		() => serializeRows(rows, genFields, options),
		[rows, genFields, options],
	);

	const isStale =
		deferredFields !== fields ||
		deferredCount !== count ||
		deferredSeed !== seed;

	function updateField(key: string, patch: Partial<SchemaField>) {
		setFields((prev) =>
			prev.map((f) => (f.key === key ? { ...f, ...patch } : f)),
		);
	}

	function addField() {
		setFields((prev) => [
			...prev,
			{ key: newKey(), name: "firstName", typeId: "firstName" },
		]);
	}

	function removeField(key: string) {
		setFields((prev) => prev.filter((f) => f.key !== key));
	}

	function setOption<K extends keyof SerializeOptions>(
		k: K,
		v: SerializeOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [k]: v }));
	}

	function handleSaveSchema() {
		const name = schemaName.trim() || "Untitled schema";
		const next = saveSchema(name, currentConfig);
		setSavedList(next);
		setSelectedId(next.find((s) => s.name === name)?.id ?? "");
		setSchemaName(name);
		toast.success(`Saved “${name}”`);
	}

	function handleLoadSchema(id: string) {
		const schema = savedList.find((s) => s.id === id);
		if (!schema) return;
		applyConfig(schema.config);
		setSelectedId(id);
		setSchemaName(schema.name);
		setBackedUpSig(JSON.stringify(schema.config));
		toast.success(`Loaded “${schema.name}”`);
	}

	function handleDeleteSchema() {
		if (!selectedId) return;
		const name = savedList.find((s) => s.id === selectedId)?.name;
		setSavedList(deleteSchema(selectedId));
		setSelectedId("");
		toast.success(`Deleted “${name ?? "schema"}”`);
	}

	function handleExportSchema() {
		const name = schemaName.trim() || "Schema";
		downloadText(
			serializeSchemaFile(name, currentConfig),
			`${fileSlug(name)}.json`,
			"application/json",
		);
		setBackedUpSig(signature);
		toast.success("Schema exported");
	}

	async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = ""; // allow re-importing the same file
		if (!file) return;
		const parsed = parseSchemaFile(await file.text());
		if (!parsed) {
			toast.error("That doesn't look like a valid schema file.");
			return;
		}
		applyConfig(parsed.config);
		setSchemaName(parsed.name);
		setSelectedId("");
		setBackedUpSig(JSON.stringify(parsed.config));
		toast.success(`Imported “${parsed.name}”`);
	}

	function toggleReminder(value: boolean) {
		setBackupReminder(value);
		savePrefs({ backupReminder: value });
	}

	async function handleCopy() {
		if (!output) {
			toast.info("Nothing to copy yet.");
			return;
		}
		try {
			await navigator.clipboard.writeText(output);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	function handleDownloadData() {
		if (!output) return;
		const { ext, mime } = FORMAT_META[options.format];
		downloadText(output, `mock-data.${ext}`, mime);
	}

	const tooMany = (count || 0) > MAX_ROWS;

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="flex flex-wrap items-end gap-2">
						<div className="space-y-1.5">
							<Label htmlFor="saved-schema">Saved schemas</Label>
							{savedList.length > 0 ? (
								<Select value={selectedId} onValueChange={handleLoadSchema}>
									<SelectTrigger id="saved-schema" className="w-56">
										<SelectValue placeholder="Load a saved schema…" />
									</SelectTrigger>
									<SelectContent>
										{savedList.map((schema) => (
											<SelectItem key={schema.id} value={schema.id}>
												{schema.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<p className="text-muted-foreground flex h-9 items-center text-sm">
									None saved yet
								</p>
							)}
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="size-9"
							onClick={handleDeleteSchema}
							disabled={!selectedId}
							aria-label="Delete saved schema"
						>
							<Trash2Icon className="size-4" />
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<Switch
							id="backup-reminder"
							checked={backupReminder}
							onCheckedChange={toggleReminder}
						/>
						<Label htmlFor="backup-reminder" className="font-normal">
							Backup reminder
						</Label>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="text-muted-foreground/70 hover:text-foreground"
									aria-label="About the backup reminder"
								>
									<InfoIcon className="size-3.5" />
								</button>
							</TooltipTrigger>
							<TooltipContent className="max-w-64">
								Occasionally pulses the Export button while you have unsaved
								changes, as a nudge to back your schema up to a file. Saved
								schemas live in this browser and can be cleared by it; an exported
								file is the durable backup.
							</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<div className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3">
					<div className="min-w-48 flex-1 space-y-1.5">
						<Label htmlFor="schema-name">Name</Label>
						<Input
							id="schema-name"
							value={schemaName}
							onChange={(event) => setSchemaName(event.target.value)}
							placeholder="My users table"
							className="font-mono"
							spellCheck={false}
						/>
					</div>
					<Button onClick={handleSaveSchema}>
						<SaveIcon className="size-4" />
						Save
					</Button>
					<Button
						variant="outline"
						onClick={handleExportSchema}
						className={cn(
							"transition-shadow",
							nudging && "ring-primary/60 animate-pulse ring-2",
						)}
					>
						<FileDownIcon className="size-4" />
						Export
					</Button>
					<Button
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
					>
						<FileUpIcon className="size-4" />
						Import
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="application/json,.json"
						hidden
						onChange={handleImportFile}
					/>
				</div>
			</section>

			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<div className="mb-4 flex items-center justify-between gap-2">
					<h2 className="text-sm font-medium">Schema</h2>
					<span className="text-muted-foreground text-xs">
						{fields.length} {fields.length === 1 ? "field" : "fields"}
					</span>
				</div>

				<div className="space-y-2">
					{fields.map((field) => (
						<div key={field.key} className="flex items-center gap-2">
							<Input
								value={field.name}
								onChange={(event) =>
									updateField(field.key, { name: event.target.value })
								}
								placeholder="column_name"
								spellCheck={false}
								className="flex-1 font-mono text-sm"
								aria-label="Field name"
							/>
							<FieldTypeCombobox
								value={field.typeId}
								onChange={(value) => updateField(field.key, { typeId: value })}
								triggerClassName="w-full sm:w-52"
							/>
							<Button
								variant="ghost"
								size="icon"
								className="size-9 shrink-0"
								onClick={() => removeField(field.key)}
								disabled={fields.length === 1}
								aria-label={`Remove ${field.name}`}
							>
								<XIcon className="size-4" />
							</Button>
						</div>
					))}
				</div>

				<Button variant="outline" size="sm" className="mt-3" onClick={addField}>
					<PlusIcon className="size-4" />
					Add field
				</Button>
			</section>

			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<div className="flex flex-wrap items-end gap-4">
					<div className="space-y-1.5">
						<Label htmlFor="rows">Rows</Label>
						<Input
							id="rows"
							type="number"
							min={1}
							max={MAX_ROWS}
							value={count}
							onChange={(event) => setCount(event.target.valueAsNumber || 0)}
							className={cn("w-28", tooMany && "border-destructive")}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="format">Format</Label>
						<Select
							value={options.format}
							onValueChange={(value) => setOption("format", value as ExportFormat)}
						>
							<SelectTrigger id="format" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FORMAT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{options.format === "sql" ? (
						<div className="space-y-1.5">
							<Label htmlFor="table-name">Table name</Label>
							<Input
								id="table-name"
								value={options.tableName}
								onChange={(event) => setOption("tableName", event.target.value)}
								className="w-44 font-mono"
								spellCheck={false}
							/>
						</div>
					) : null}

					{options.format === "ts" ? (
						<>
							<div className="space-y-1.5">
								<Label htmlFor="type-name">Type name</Label>
								<Input
									id="type-name"
									value={options.typeName}
									onChange={(event) => setOption("typeName", event.target.value)}
									className="w-32 font-mono"
									spellCheck={false}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="const-name">Const name</Label>
								<Input
									id="const-name"
									value={options.constName}
									onChange={(event) => setOption("constName", event.target.value)}
									className="w-32 font-mono"
									spellCheck={false}
								/>
							</div>
						</>
					) : null}

					<Button
						variant="outline"
						onClick={() => setSeed((s) => s + 1)}
						disabled={!faker}
					>
						<RefreshCwIcon className="size-4" />
						Regenerate
					</Button>
				</div>
				{tooMany ? (
					<p className="text-destructive mt-2 text-xs">
						Capped at {MAX_ROWS.toLocaleString()} rows to keep things responsive.
					</p>
				) : null}
			</section>

			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<div className="flex items-center gap-2">
						<h2 className="text-sm font-medium">Output</h2>
						{loading ? (
							<Badge variant="secondary" className="text-muted-foreground gap-1">
								<Loader2Icon className="size-3 animate-spin" />
								Loading…
							</Badge>
						) : isStale ? (
							<Badge variant="secondary" className="text-muted-foreground">
								Generating…
							</Badge>
						) : rows.length > 0 ? (
							<Badge variant="secondary" className="tabular-nums">
								{rows.length.toLocaleString()}{" "}
								{rows.length === 1 ? "row" : "rows"}
							</Badge>
						) : null}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDownloadData}
							disabled={!output}
						>
							<DownloadIcon className="size-4" />
							Download
						</Button>
						<Button size="sm" onClick={handleCopy} disabled={!output}>
							<CopyIcon className="size-4" />
							Copy
						</Button>
					</div>
				</header>
				<Textarea
					value={output}
					readOnly
					placeholder={
						loadError
							? `Couldn't load the generator: ${loadError}`
							: "Your generated data appears here."
					}
					spellCheck={false}
					className={cn(
						"min-h-80 resize-y rounded-none border-0 font-mono text-xs shadow-none transition-opacity focus-visible:ring-0",
						!output && "text-muted-foreground",
						isStale && "opacity-50",
					)}
				/>
			</section>
		</div>
	);
}
