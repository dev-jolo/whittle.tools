import { useState } from "react";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
	type Rgb,
	parseColor,
	toHex,
	toHslString,
	toRgbString,
} from "./transform";

type Field = "hex" | "rgb" | "hsl";

const DEFAULT_RGB: Rgb = { r: 99, g: 102, b: 241 };

const FIELDS: { key: Field; label: string; format: (rgb: Rgb) => string }[] = [
	{ key: "hex", label: "HEX", format: toHex },
	{ key: "rgb", label: "RGB", format: toRgbString },
	{ key: "hsl", label: "HSL", format: toHslString },
];

export function ColorConverter() {
	const [rgb, setRgb] = useState<Rgb | undefined>(DEFAULT_RGB);
	const [active, setActive] = useState<Field | null>(null);
	const [activeText, setActiveText] = useState("");
	const [error, setError] = useState<string | null>(null);

	function handleChange(field: Field, text: string) {
		setActive(field);
		setActiveText(text);
		const result = parseColor(text);
		if (result.ok) {
			setRgb(result.rgb);
			setError(null);
		} else {
			setError(result.error ?? "Not a recognizable color.");
		}
	}

	function setFromPicker(hex: string) {
		const result = parseColor(hex);
		if (result.ok) {
			setRgb(result.rgb);
			setActive(null);
			setActiveText("");
			setError(null);
		}
	}

	function fieldValue(field: Field): string {
		if (active === field) return activeText;
		if (!rgb) return "";
		return FIELDS.find((f) => f.key === field)!.format(rgb);
	}

	async function copy(field: Field) {
		const text = fieldValue(field);
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	const swatch = rgb ? toHex(rgb) : "transparent";
	const pickerValue = rgb ? toHex(rgb) : "#000000";

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
					<div className="flex items-center gap-4">
						<div
							className="size-20 shrink-0 rounded-xl border"
							style={{ backgroundColor: swatch }}
							aria-label="Color preview"
						/>
						<label className="text-sm font-medium">
							<span className="text-muted-foreground mb-1.5 block font-normal">
								Pick a color
							</span>
							<input
								type="color"
								value={pickerValue}
								onChange={(event) => setFromPicker(event.target.value)}
								className="h-10 w-16 cursor-pointer rounded-md border bg-transparent"
								aria-label="Color picker"
							/>
						</label>
					</div>

					<div className="grid flex-1 gap-3 sm:grid-cols-3">
						{FIELDS.map(({ key, label }) => {
							const invalid = error !== null && active === key;
							return (
								<div key={key} className="space-y-1.5">
									<Label htmlFor={`color-${key}`}>{label}</Label>
									<div className="flex gap-1.5">
										<Input
											id={`color-${key}`}
											value={fieldValue(key)}
											onChange={(event) => handleChange(key, event.target.value)}
											spellCheck={false}
											autoComplete="off"
											className={cn(
												"font-mono",
												invalid &&
													"border-destructive focus-visible:ring-destructive/30",
											)}
										/>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => copy(key)}
											disabled={!fieldValue(key)}
											aria-label={`Copy ${label}`}
										>
											<CopyIcon className="size-4" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{error ? <p className="text-destructive mt-3 text-sm">{error}</p> : null}
			</section>
		</div>
	);
}
