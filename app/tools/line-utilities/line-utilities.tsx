import { useDeferredValue, useMemo, useState } from "react";
import {
	CopyIcon,
	InfoIcon,
	ShuffleIcon,
	SparklesIcon,
	Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	type LineOptions,
	type LineSort,
	processLines,
} from "./transform";

const SAMPLE_INPUT = [
	"  banana",
	"Apple",
	"cherry",
	"apple",
	"",
	"Banana",
	"date  ",
].join("\n");

const SORT_OPTIONS: { value: LineSort; label: string }[] = [
	{ value: "none", label: "Original order" },
	{ value: "asc", label: "A → Z" },
	{ value: "desc", label: "Z → A" },
	{ value: "length", label: "By length" },
];

function ToggleRow({
	id,
	label,
	hint,
	checked,
	onCheckedChange,
	disabled,
}: {
	id: string;
	label: string;
	hint: string;
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
	disabled?: boolean;
}) {
	return (
		// Switch trails its label in a tight, content-width group (see splitter.tsx
		// for the rationale — a far-right switch in a wide cell hurts scanning).
		<div className={cn("flex items-center gap-2", disabled && "opacity-50")}>
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
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={onCheckedChange}
				disabled={disabled}
			/>
		</div>
	);
}

export function LineUtilities() {
	const [input, setInput] = useState("");
	const [options, setOptions] = useState<LineOptions>(DEFAULT_OPTIONS);

	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => processLines(deferredInput, options),
		[deferredInput, options],
	);
	const isStale = deferredInput !== input;

	function setOption<K extends keyof LineOptions>(
		key: K,
		value: LineOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	function reshuffle() {
		// Bumping the seed re-randomizes; enabling shuffle if it was off.
		setOptions((prev) => ({
			...prev,
			shuffle: true,
			shuffleSeed: prev.shuffleSeed + 1,
		}));
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
				<h2 className="mb-4 text-sm font-medium">Operations</h2>
				<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
					<div className="flex items-center gap-2">
						<Label htmlFor="sort" className="font-normal">
							Sort
						</Label>
						<Select
							value={options.sort}
							onValueChange={(value) => setOption("sort", value as LineSort)}
						>
							<SelectTrigger id="sort" size="sm" className="w-40">
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
					</div>

					<ToggleRow
						id="trim"
						label="Trim"
						hint="Remove leading and trailing whitespace from each line."
						checked={options.trim}
						onCheckedChange={(value) => setOption("trim", value)}
					/>
					<ToggleRow
						id="remove-empty"
						label="Remove empty"
						hint="Drop blank lines."
						checked={options.removeEmpty}
						onCheckedChange={(value) => setOption("removeEmpty", value)}
					/>
					<ToggleRow
						id="dedupe"
						label="Dedupe"
						hint="Keep only the first occurrence of each line."
						checked={options.dedupe}
						onCheckedChange={(value) => setOption("dedupe", value)}
					/>
					<ToggleRow
						id="ignore-case"
						label="Ignore case"
						hint="Compare case-insensitively when deduping and sorting."
						checked={options.ignoreCase}
						onCheckedChange={(value) => setOption("ignoreCase", value)}
						disabled={!options.dedupe && options.sort === "none"}
					/>
					<ToggleRow
						id="reverse"
						label="Reverse"
						hint="Reverse the final order of the lines."
						checked={options.reverse}
						onCheckedChange={(value) => setOption("reverse", value)}
					/>

					<div className="flex items-center gap-2">
						<ToggleRow
							id="shuffle"
							label="Shuffle"
							hint="Randomize the order. Use the reshuffle button for a new arrangement."
							checked={options.shuffle}
							onCheckedChange={(value) => setOption("shuffle", value)}
						/>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="size-7"
									onClick={reshuffle}
									aria-label="Reshuffle"
								>
									<ShuffleIcon className="size-3.5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Reshuffle</TooltipContent>
						</Tooltip>
					</div>
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
						placeholder={"Paste your lines here…\none\ntwo\nthree"}
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
									{result.count} {result.count === 1 ? "line" : "lines"}
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
						placeholder="Your processed lines appear here."
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
