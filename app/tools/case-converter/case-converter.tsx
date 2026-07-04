import { useDeferredValue, useMemo, useState } from "react";
import { CopyIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { convertCase } from "./transform";

const SAMPLE = "convert This_string-toAnyCase";

function VariantRow({ label, value }: { label: string; value: string }) {
	async function copy() {
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`Copied ${label}`);
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}
	return (
		<div className="flex items-center gap-3 px-3 py-2">
			<span className="text-muted-foreground w-36 shrink-0 font-mono text-xs">
				{label}
			</span>
			<span className="min-w-0 flex-1 font-mono text-sm break-all">{value}</span>
			<Button
				variant="ghost"
				size="icon"
				className="size-7 shrink-0"
				onClick={copy}
				disabled={!value}
				aria-label={`Copy ${label}`}
			>
				<CopyIcon className="size-3.5" />
			</Button>
		</div>
	);
}

export function CaseConverter() {
	const [input, setInput] = useState("");

	const deferredInput = useDeferredValue(input);
	const variants = useMemo(() => convertCase(deferredInput), [deferredInput]);
	const isStale = deferredInput !== input;
	const hasInput = input.trim() !== "";

	return (
		<div className="space-y-6">
			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">Input</h2>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setInput(SAMPLE)}
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
					placeholder="Type or paste text in any case…"
					spellCheck={false}
					className="min-h-28 resize-y rounded-none border-0 text-sm shadow-none focus-visible:ring-0"
				/>
			</section>

			{hasInput ? (
				<section
					className={cn(
						"bg-card divide-y rounded-xl border transition-opacity",
						isStale && "opacity-50",
					)}
				>
					{variants.map((variant) => (
						<VariantRow
							key={variant.key}
							label={variant.label}
							value={variant.value}
						/>
					))}
				</section>
			) : (
				<p className="text-muted-foreground bg-card rounded-xl border p-6 text-center text-sm">
					Enter some text to see it in every case.
				</p>
			)}
		</div>
	);
}
