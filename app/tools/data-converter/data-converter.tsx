import { useDeferredValue, useMemo, useState } from "react";
import {
	ArrowRightLeftIcon,
	CopyIcon,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DATA_FORMATS, type DataFormat, convertData } from "./transform";

const SAMPLES: Record<DataFormat, string> = {
	json: '[\n  { "name": "Ada", "role": "engineer" },\n  { "name": "Alan", "role": "scientist" }\n]',
	csv: "name,role\nAda,engineer\nAlan,scientist",
	yaml: "- name: Ada\n  role: engineer\n- name: Alan\n  role: scientist",
};

function FormatSelect({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: DataFormat;
	onChange: (value: DataFormat) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<Label htmlFor={id} className="text-muted-foreground text-sm font-normal">
				{label}
			</Label>
			<Select value={value} onValueChange={(v) => onChange(v as DataFormat)}>
				<SelectTrigger id={id} className="w-28">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{DATA_FORMATS.map((format) => (
						<SelectItem key={format.value} value={format.value}>
							{format.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

export function DataConverter() {
	const [from, setFrom] = useState<DataFormat>("json");
	const [to, setTo] = useState<DataFormat>("csv");
	const [input, setInput] = useState("");

	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => convertData(deferredInput, from, to),
		[deferredInput, from, to],
	);
	const isStale = deferredInput !== input;

	const hasInput = input.trim() !== "";
	const showError = hasInput && !result.ok && !isStale;
	const output = result.ok ? result.output : "";

	// Swap the directions and feed the current output back in, so repeated
	// swaps round-trip cleanly.
	function swap() {
		setFrom(to);
		setTo(from);
		if (result.ok && result.output) setInput(result.output);
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

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Convert</h2>
				<div className="flex flex-wrap items-center gap-3">
					<FormatSelect id="from" label="From" value={from} onChange={setFrom} />
					<Button
						variant="ghost"
						size="icon"
						onClick={swap}
						aria-label="Swap formats"
						title="Swap formats"
					>
						<ArrowRightLeftIcon className="size-4" />
					</Button>
					<FormatSelect id="to" label="To" value={to} onChange={setTo} />
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
								onClick={() => setInput(SAMPLES[from])}
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
						placeholder={`Paste ${from.toUpperCase()} here…`}
						spellCheck={false}
						className="min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
					/>
				</section>

				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<div className="flex items-center gap-2">
							<h2 className="text-sm font-medium">Output</h2>
							{isStale && hasInput ? (
								<Badge variant="secondary" className="text-muted-foreground">
									Working…
								</Badge>
							) : showError ? (
								<Badge variant="destructive">Invalid input</Badge>
							) : null}
						</div>
						<Button size="sm" onClick={handleCopy} disabled={!output}>
							<CopyIcon className="size-4" />
							Copy
						</Button>
					</header>
					<Textarea
						value={output}
						readOnly
						placeholder={`${to.toUpperCase()} output appears here.`}
						spellCheck={false}
						className={cn(
							"min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none transition-opacity focus-visible:ring-0",
							!output && "text-muted-foreground",
							isStale && "opacity-50",
						)}
					/>
					{showError ? (
						<div className="text-destructive border-t px-3 py-2 text-sm">
							{result.error}
						</div>
					) : null}
				</section>
			</div>
		</div>
	);
}
