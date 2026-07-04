import { useCallback, useEffect, useState } from "react";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ToggleField } from "../shared/codec-panel";
import {
	DEFAULT_OPTIONS,
	type LoremOptions,
	type LoremUnit,
	generateLorem,
} from "./transform";

const UNITS: { value: LoremUnit; label: string }[] = [
	{ value: "paragraphs", label: "Paragraphs" },
	{ value: "sentences", label: "Sentences" },
	{ value: "words", label: "Words" },
];

export function LoremIpsum() {
	const [options, setOptions] = useState<LoremOptions>(DEFAULT_OPTIONS);
	const [text, setText] = useState("");

	const generate = useCallback(
		() => setText(generateLorem(options)),
		[options],
	);
	// Generate on the client (randomness would mismatch during SSR) and whenever
	// the options change.
	useEffect(() => {
		generate();
	}, [generate]);

	function setOption<K extends keyof LoremOptions>(
		key: K,
		value: LoremOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	async function handleCopy() {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
					<div className="space-y-1.5">
						<Label htmlFor="lorem-count">How many</Label>
						<Input
							id="lorem-count"
							type="number"
							min={1}
							max={100}
							value={options.count}
							onChange={(event) => setOption("count", Number(event.target.value))}
							className="w-28"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="lorem-unit">Of</Label>
						<Select
							value={options.unit}
							onValueChange={(value) => setOption("unit", value as LoremUnit)}
						>
							<SelectTrigger id="lorem-unit" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{UNITS.map((unit) => (
									<SelectItem key={unit.value} value={unit.value}>
										{unit.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="sm:pb-2.5">
						<ToggleField
							id="lorem-start"
							label="Start with “Lorem ipsum…”"
							hint="Begin with the traditional opening line."
							checked={options.startWithLorem}
							onCheckedChange={(v) => setOption("startWithLorem", v)}
						/>
					</div>
					<Button onClick={generate} className="sm:ml-auto">
						<RefreshCwIcon className="size-4" />
						Regenerate
					</Button>
				</div>
			</section>

			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<div className="flex items-center gap-2">
						<h2 className="text-sm font-medium">Output</h2>
						<Badge variant="secondary" className="tabular-nums">
							{wordCount} {wordCount === 1 ? "word" : "words"}
						</Badge>
					</div>
					<Button size="sm" onClick={handleCopy} disabled={!text}>
						<CopyIcon className="size-4" />
						Copy
					</Button>
				</header>
				<Textarea
					value={text}
					readOnly
					spellCheck={false}
					className="min-h-64 resize-y rounded-none border-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
				/>
			</section>
		</div>
	);
}
