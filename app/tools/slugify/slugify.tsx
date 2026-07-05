import { useDeferredValue, useMemo, useState } from "react";
import { CopyIcon, InfoIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

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
import { DEFAULT_OPTIONS, type SlugifyOptions, slugify } from "./transform";

const SAMPLE = "10 Things I Learned Building Crème Brûlée & Node.js Apps!";

// Radix `SelectItem` forbids an empty-string value, so "None" uses a sentinel
// that maps to an empty separator.
const NONE_SEPARATOR = "none";

const SEPARATOR_OPTIONS: { value: string; label: string }[] = [
	{ value: "-", label: "Hyphen -" },
	{ value: "_", label: "Underscore _" },
	{ value: NONE_SEPARATOR, label: "None" },
];

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
		<div className="flex items-center gap-2">
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
			<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
}

export function Slugify() {
	const [input, setInput] = useState("");
	const [options, setOptions] = useState<SlugifyOptions>(DEFAULT_OPTIONS);

	const deferredInput = useDeferredValue(input);
	const slug = useMemo(
		() => slugify(deferredInput, options),
		[deferredInput, options],
	);
	const isStale = deferredInput !== input;

	function setOption<K extends keyof SlugifyOptions>(
		key: K,
		value: SlugifyOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	async function handleCopy() {
		if (!slug) {
			toast.info("Nothing to copy yet.");
			return;
		}
		try {
			await navigator.clipboard.writeText(slug);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="space-y-6">
			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">Text</h2>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE)}>
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
					placeholder="My Awesome Blog Post Title"
					spellCheck={false}
					className="min-h-24 resize-y rounded-none border-0 text-sm shadow-none focus-visible:ring-0"
				/>
				<div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t p-3">
					<div className="flex items-center gap-2">
						<Label htmlFor="separator" className="font-normal">
							Separator
						</Label>
						<Select
							value={options.separator || NONE_SEPARATOR}
							onValueChange={(value) =>
								setOption("separator", value === NONE_SEPARATOR ? "" : value)
							}
						>
							<SelectTrigger id="separator" size="sm" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{SEPARATOR_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<ToggleRow
						id="lowercase"
						label="Lowercase"
						hint="Convert the slug to lowercase."
						checked={options.lowercase}
						onCheckedChange={(value) => setOption("lowercase", value)}
					/>
					<ToggleRow
						id="strict"
						label="Strict"
						hint="Remove anything that isn't a letter, number, or separator."
						checked={options.strict}
						onCheckedChange={(value) => setOption("strict", value)}
					/>
				</div>
			</section>

			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">Slug</h2>
					<Button size="sm" onClick={handleCopy} disabled={!slug}>
						<CopyIcon className="size-4" />
						Copy
					</Button>
				</header>
				<div className="p-4">
					{slug ? (
						<code
							className={cn(
								"font-mono text-base break-all transition-opacity sm:text-lg",
								isStale && "opacity-50",
							)}
						>
							{slug}
						</code>
					) : (
						<p className="text-muted-foreground text-sm">
							Your URL-safe slug appears here.
						</p>
					)}
				</div>
			</section>
		</div>
	);
}
