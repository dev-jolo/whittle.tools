import { useCallback, useEffect, useState } from "react";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ToggleField } from "../shared/codec-panel";
import {
	DEFAULT_OPTIONS,
	type PasswordOptions,
	entropyBits,
	generatePassword,
} from "./transform";

function strength(bits: number): { label: string; className: string } {
	if (bits < 40)
		return { label: "Weak", className: "bg-red-500/15 text-red-600 dark:text-red-400" };
	if (bits < 60)
		return {
			label: "Fair",
			className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
		};
	if (bits < 80)
		return {
			label: "Strong",
			className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
		};
	return {
		label: "Very strong",
		className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
	};
}

export function PasswordGenerator() {
	const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
	const [password, setPassword] = useState("");

	const generate = useCallback(
		() => setPassword(generatePassword(options)),
		[options],
	);
	// Generate on the client (randomness would mismatch during SSR) and whenever
	// the options change.
	useEffect(() => {
		generate();
	}, [generate]);

	function setOption<K extends keyof PasswordOptions>(
		key: K,
		value: PasswordOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	const bits = entropyBits(options);
	const meter = strength(bits);
	const noneSelected = password === "";

	async function handleCopy() {
		if (!password) return;
		try {
			await navigator.clipboard.writeText(password);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<div className="flex items-center gap-2">
					<Input
						value={password}
						readOnly
						placeholder="Select at least one character type"
						spellCheck={false}
						className="h-12 font-mono text-base"
					/>
					<Button
						variant="outline"
						size="icon"
						className="size-12 shrink-0"
						onClick={generate}
						aria-label="Regenerate"
					>
						<RefreshCwIcon className="size-4" />
					</Button>
					<Button
						size="icon"
						className="size-12 shrink-0"
						onClick={handleCopy}
						disabled={!password}
						aria-label="Copy"
					>
						<CopyIcon className="size-4" />
					</Button>
				</div>
				{!noneSelected ? (
					<div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
						<Badge variant="secondary" className={cn("border-0", meter.className)}>
							{meter.label}
						</Badge>
						<span className="tabular-nums">~{bits} bits of entropy</span>
					</div>
				) : null}
			</section>

			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Label htmlFor="pw-length" className="w-28">
							Length
						</Label>
						<Input
							id="pw-length"
							type="number"
							min={1}
							max={256}
							value={options.length}
							onChange={(event) => setOption("length", Number(event.target.value))}
							className="w-28"
						/>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<ToggleField
							id="pw-lowercase"
							label="Lowercase a–z"
							hint="Include lowercase letters."
							checked={options.lowercase}
							onCheckedChange={(v) => setOption("lowercase", v)}
						/>
						<ToggleField
							id="pw-uppercase"
							label="Uppercase A–Z"
							hint="Include uppercase letters."
							checked={options.uppercase}
							onCheckedChange={(v) => setOption("uppercase", v)}
						/>
						<ToggleField
							id="pw-digits"
							label="Digits 0–9"
							hint="Include numbers."
							checked={options.digits}
							onCheckedChange={(v) => setOption("digits", v)}
						/>
						<ToggleField
							id="pw-symbols"
							label="Symbols"
							hint="Include punctuation like !@#$%."
							checked={options.symbols}
							onCheckedChange={(v) => setOption("symbols", v)}
						/>
						<ToggleField
							id="pw-ambiguous"
							label="No look-alikes"
							hint="Exclude visually ambiguous characters like O/0 and l/1/I."
							checked={options.excludeAmbiguous}
							onCheckedChange={(v) => setOption("excludeAmbiguous", v)}
						/>
					</div>
				</div>
			</section>
		</div>
	);
}
