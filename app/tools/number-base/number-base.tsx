import { useState } from "react";
import { CopyIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
	BASES,
	type NumberBase,
	formatInBase,
	parseInBase,
} from "./transform";

export function NumberBaseConverter() {
	const [value, setValue] = useState<bigint | undefined>(undefined);
	const [active, setActive] = useState<NumberBase | null>(null);
	const [activeText, setActiveText] = useState("");
	const [error, setError] = useState<string | null>(null);

	function handleChange(base: NumberBase, text: string) {
		setActive(base);
		setActiveText(text);
		const result = parseInBase(text, base);
		if (result.ok) {
			setValue(result.value);
			setError(null);
		} else {
			setError(result.error ?? "Invalid number.");
		}
	}

	function fieldValue(base: NumberBase): string {
		if (active === base) return activeText;
		if (value === undefined) return "";
		return formatInBase(value, base);
	}

	function reset() {
		setValue(undefined);
		setActive(null);
		setActiveText("");
		setError(null);
	}

	async function copy(base: NumberBase) {
		const text = fieldValue(base);
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<div className="mb-4 flex items-center justify-between gap-2">
					<h2 className="text-sm font-medium">
						Edit any field — the rest update
					</h2>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleChange(10, "255")}
						>
							<SparklesIcon className="size-4" />
							Example
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={reset}
							disabled={value === undefined && activeText === ""}
						>
							<Trash2Icon className="size-4" />
							Clear
						</Button>
					</div>
				</div>

				<div className="space-y-4">
					{BASES.map(({ base, label, prefix }) => {
						const invalid = error !== null && active === base;
						return (
							<div key={base} className="space-y-1.5">
								<Label htmlFor={`base-${base}`}>
									{label}
									{prefix ? (
										<span className="text-muted-foreground ml-1 font-mono text-xs">
											{prefix}
										</span>
									) : null}
								</Label>
								<div className="flex gap-2">
									<Input
										id={`base-${base}`}
										value={fieldValue(base)}
										onChange={(event) => handleChange(base, event.target.value)}
										placeholder={`Enter a ${label.toLowerCase()} value…`}
										spellCheck={false}
										autoComplete="off"
										className={cn(
											"font-mono",
											invalid && "border-destructive focus-visible:ring-destructive/30",
										)}
									/>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => copy(base)}
										disabled={!fieldValue(base)}
										aria-label={`Copy ${label}`}
									>
										<CopyIcon className="size-4" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>

				{error ? <p className="text-destructive mt-3 text-sm">{error}</p> : null}
			</section>
		</div>
	);
}
