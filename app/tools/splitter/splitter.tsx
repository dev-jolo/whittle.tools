import { useDeferredValue, useMemo, useState } from "react";
import { CopyIcon, InfoIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";
import {
	DEFAULT_OPTIONS,
	type SplitDelimiter,
	type QuoteStyle,
	type SortOrder,
	type SplitterOptions,
	splitText,
} from "./transform";

const SAMPLE_INPUT = ["apple", "banana", "cherry", "", "apple", "Date"].join(
	"\n",
);

const SPLIT_OPTIONS: { value: SplitDelimiter; label: string }[] = [
	{ value: "newline", label: "New lines" },
	{ value: "comma", label: "Commas" },
	{ value: "space", label: "Spaces" },
	{ value: "semicolon", label: "Semicolons" },
	{ value: "tab", label: "Tabs" },
	{ value: "custom", label: "Custom…" },
];

const QUOTE_OPTIONS: { value: QuoteStyle; label: string }[] = [
	{ value: "none", label: "None" },
	{ value: "double", label: 'Double "' },
	{ value: "single", label: "Single '" },
	{ value: "backtick", label: "Backtick `" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
	{ value: "none", label: "Original order" },
	{ value: "asc", label: "A → Z" },
	{ value: "desc", label: "Z → A" },
];

/** Label with an optional info tooltip describing what the control does. */
function Field({
	label,
	hint,
	htmlFor,
	children,
}: {
	label: string;
	hint?: string;
	htmlFor?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-1.5">
				<Label htmlFor={htmlFor}>{label}</Label>
				{hint ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="text-muted-foreground/70 hover:text-foreground"
								aria-label={`About ${label}`}
							>
								<InfoIcon className="size-3.5" />
							</button>
						</TooltipTrigger>
						<TooltipContent className="max-w-56">{hint}</TooltipContent>
					</Tooltip>
				) : null}
			</div>
			{children}
		</div>
	);
}

function ToggleRow({
	id,
	label,
	hint,
	checked,
	onCheckedChange,
}: {
	id: string;
	label: string;
	hint: string;
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex items-center gap-1.5">
				<Label htmlFor={id} className="font-normal">
					{label}
				</Label>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							className="text-muted-foreground/70 hover:text-foreground"
							aria-label={`About ${label}`}
						>
							<InfoIcon className="size-3.5" />
						</button>
					</TooltipTrigger>
					<TooltipContent className="max-w-56">{hint}</TooltipContent>
				</Tooltip>
			</div>
			<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
}

export function Splitter() {
	const [input, setInput] = useState("");
	const [options, setOptions] = useState<SplitterOptions>(DEFAULT_OPTIONS);

	// Derive from a deferred copy of the input so typing and large pastes stay
	// responsive — the split + output render run at a lower priority. `isStale`
	// is true while the output is catching up. Everything is client-side (the
	// app is an offline PWA), so this keeps heavy work off the typing path.
	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => splitText(deferredInput, options),
		[deferredInput, options],
	);
	const isStale = deferredInput !== input;

	function setOption<K extends keyof SplitterOptions>(
		key: K,
		value: SplitterOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	async function handleCopy() {
		if (!result.output) {
			toast.info("Nothing to copy yet.");
			return;
		}
		try {
			await navigator.clipboard.writeText(result.output);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Field
						label="Split input by"
						htmlFor="split-by"
						hint="How the pasted text is broken into individual items."
					>
						<Select
							value={options.splitBy}
							onValueChange={(value) =>
								setOption("splitBy", value as SplitDelimiter)
							}
						>
							<SelectTrigger id="split-by" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{SPLIT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					{options.splitBy === "custom" ? (
						<Field
							label="Custom delimiter"
							htmlFor="custom-delimiter"
							hint="The exact string used to separate items, e.g. | or ::"
						>
							<Input
								id="custom-delimiter"
								value={options.customDelimiter}
								onChange={(event) =>
									setOption("customDelimiter", event.target.value)
								}
								placeholder="e.g. |"
							/>
						</Field>
					) : null}

					<Field
						label="Wrap each item"
						htmlFor="quote"
						hint="Wrap every item in quotes — handy for building code arrays."
					>
						<Select
							value={options.quote}
							onValueChange={(value) =>
								setOption("quote", value as QuoteStyle)
							}
						>
							<SelectTrigger id="quote" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{QUOTE_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<Field
						label="Sort"
						htmlFor="sort"
						hint="Reorder items alphabetically (numbers are compared naturally)."
					>
						<Select
							value={options.sort}
							onValueChange={(value) => setOption("sort", value as SortOrder)}
						>
							<SelectTrigger id="sort" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{SORT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<Field
						label="Separator"
						htmlFor="separator"
						hint="Placed between items in the output, e.g. a comma and space."
					>
						<Input
							id="separator"
							value={options.separator}
							onChange={(event) => setOption("separator", event.target.value)}
							placeholder=", "
						/>
					</Field>

					<div className="grid grid-cols-2 gap-3">
						<Field
							label="Prefix"
							htmlFor="prefix"
							hint="Text added to the very start of the output."
						>
							<Input
								id="prefix"
								value={options.prefix}
								onChange={(event) => setOption("prefix", event.target.value)}
								placeholder="["
							/>
						</Field>
						<Field
							label="Suffix"
							htmlFor="suffix"
							hint="Text added to the very end of the output."
						>
							<Input
								id="suffix"
								value={options.suffix}
								onChange={(event) => setOption("suffix", event.target.value)}
								placeholder="]"
							/>
						</Field>
					</div>
				</div>

				<div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
					<ToggleRow
						id="trim"
						label="Trim whitespace"
						hint="Remove leading and trailing spaces from each item."
						checked={options.trim}
						onCheckedChange={(value) => setOption("trim", value)}
					/>
					<ToggleRow
						id="remove-empty"
						label="Remove empty"
						hint="Drop blank items left behind by extra separators."
						checked={options.removeEmpty}
						onCheckedChange={(value) => setOption("removeEmpty", value)}
					/>
					<ToggleRow
						id="dedupe"
						label="Remove duplicates"
						hint="Keep only the first occurrence of each item."
						checked={options.dedupe}
						onCheckedChange={(value) => setOption("dedupe", value)}
					/>
					<ToggleRow
						id="items-per-line"
						label="One item per line"
						hint="Format the output with each item on its own line."
						checked={options.itemsPerLine}
						onCheckedChange={(value) => setOption("itemsPerLine", value)}
					/>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<h2 className="text-sm font-medium">Input</h2>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setInput(SAMPLE_INPUT)}
							>
								<SparklesIcon className="size-4" />
								Example
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setInput("")}
								disabled={!input}
							>
								<Trash2Icon className="size-4" />
								Clear
							</Button>
						</div>
					</header>
					<Textarea
						value={input}
						onChange={(event) => setInput(event.target.value)}
						placeholder={"Paste your list here…\napple\nbanana\ncherry"}
						spellCheck={false}
						className="min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
					/>
				</section>

				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<div className="flex items-center gap-2">
							<h2 className="text-sm font-medium">Output</h2>
							{isStale && input ? (
								<Badge variant="secondary" className="text-muted-foreground">
									Working…
								</Badge>
							) : (
								<Badge variant="secondary" className="tabular-nums">
									{result.count} {result.count === 1 ? "item" : "items"}
								</Badge>
							)}
						</div>
						<Button size="sm" onClick={handleCopy} disabled={!result.output}>
							<CopyIcon className="size-4" />
							Copy
						</Button>
					</header>
					<Textarea
						value={result.output}
						readOnly
						placeholder="Your formatted output appears here."
						spellCheck={false}
						className={cn(
							"min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none transition-opacity focus-visible:ring-0",
							!result.output && "text-muted-foreground",
							isStale && "opacity-50",
						)}
					/>
				</section>
			</div>
		</div>
	);
}
