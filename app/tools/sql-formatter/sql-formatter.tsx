import { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
	AlertCircleIcon,
	CopyIcon,
	Loader2Icon,
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
import { useLazyModule } from "@/lib/use-lazy-module";
import { cn } from "@/lib/utils";
import {
	DEFAULT_OPTIONS,
	DIALECTS,
	type KeywordCase,
	type SqlDialect,
	type SqlFormatFn,
	type SqlFormatOptions,
	type SqlIndent,
	formatSql,
} from "./transform";

const SAMPLE_INPUT =
	"select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true group by u.id, u.name having count(o.id) > 3 order by orders desc limit 10;";

const KEYWORD_CASE_OPTIONS: { value: KeywordCase; label: string }[] = [
	{ value: "upper", label: "UPPERCASE" },
	{ value: "lower", label: "lowercase" },
	{ value: "preserve", label: "Preserve" },
];

const INDENT_OPTIONS: { value: SqlIndent; label: string }[] = [
	{ value: "2", label: "2 spaces" },
	{ value: "4", label: "4 spaces" },
	{ value: "tab", label: "Tabs" },
];

// Module-scope loader keeps its identity stable so the import runs once.
const loadFormat = (): Promise<SqlFormatFn> =>
	import("sql-formatter").then((mod) => mod.format);

export function SqlFormatter() {
	const [input, setInput] = useState("");
	const [options, setOptions] = useState<SqlFormatOptions>(DEFAULT_OPTIONS);

	const loader = useCallback(loadFormat, []);
	const { module: format, loading, error: loadError } = useLazyModule(loader);

	const deferredInput = useDeferredValue(input);
	const result = useMemo(() => {
		if (!format) return null;
		return formatSql(deferredInput, options, format);
	}, [format, deferredInput, options]);
	const isStale = deferredInput !== input;

	function setOption<K extends keyof SqlFormatOptions>(
		key: K,
		value: SqlFormatOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	const hasInput = input.trim() !== "";
	const showError = hasInput && result !== null && !result.ok && !isStale;
	const output = result?.ok ? result.output : "";

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
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
					<div className="space-y-1.5">
						<Label htmlFor="dialect">Dialect</Label>
						<Select
							value={options.dialect}
							onValueChange={(value) => setOption("dialect", value as SqlDialect)}
						>
							<SelectTrigger id="dialect" className="w-52">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{DIALECTS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="keyword-case">Keywords</Label>
						<Select
							value={options.keywordCase}
							onValueChange={(value) =>
								setOption("keywordCase", value as KeywordCase)
							}
						>
							<SelectTrigger id="keyword-case" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{KEYWORD_CASE_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="indent">Indentation</Label>
						<Select
							value={options.indent}
							onValueChange={(value) => setOption("indent", value as SqlIndent)}
						>
							<SelectTrigger id="indent" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{INDENT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
						placeholder={"Paste your SQL here…\nselect * from users where id = 1"}
						spellCheck={false}
						className="min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
					/>
					{showError ? (
						<div className="text-destructive flex items-start gap-2 border-t px-3 py-2 text-sm">
							<AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
							<span>{result && !result.ok ? result.error : ""}</span>
						</div>
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
							) : isStale && hasInput ? (
								<Badge variant="secondary" className="text-muted-foreground">
									Formatting…
								</Badge>
							) : showError ? (
								<Badge variant="destructive">Invalid SQL</Badge>
							) : hasInput && output ? (
								<Badge variant="secondary" className="tabular-nums">
									{output.length.toLocaleString()}{" "}
									{output.length === 1 ? "char" : "chars"}
								</Badge>
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
						placeholder={
							loadError
								? `Couldn't load the formatter: ${loadError}`
								: "Your formatted SQL appears here."
						}
						spellCheck={false}
						className={cn(
							"min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none transition-opacity focus-visible:ring-0",
							!output && "text-muted-foreground",
							isStale && "opacity-50",
						)}
					/>
				</section>
			</div>
		</div>
	);
}
