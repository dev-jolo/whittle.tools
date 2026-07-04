import { useRef, useState } from "react";
import { DownloadIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

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

type Level = "L" | "M" | "Q" | "H";

const LEVELS: { value: Level; label: string }[] = [
	{ value: "L", label: "Low (7%)" },
	{ value: "M", label: "Medium (15%)" },
	{ value: "Q", label: "Quartile (25%)" },
	{ value: "H", label: "High (30%)" },
];

const SAMPLE = "https://whittle-tools.jolonoval-dev.workers.dev";

function triggerDownload(href: string, filename: string) {
	const link = document.createElement("a");
	link.href = href;
	link.download = filename;
	link.click();
}

export function QrCode() {
	const [value, setValue] = useState("");
	const [level, setLevel] = useState<Level>("M");
	const [fgColor, setFgColor] = useState("#000000");

	const svgWrap = useRef<HTMLDivElement>(null);
	const canvasWrap = useRef<HTMLDivElement>(null);

	const hasValue = value.trim() !== "";

	function downloadPng() {
		const canvas = canvasWrap.current?.querySelector("canvas");
		if (!canvas) return;
		triggerDownload(canvas.toDataURL("image/png"), "qr-code.png");
		toast.success("Downloaded PNG");
	}

	function downloadSvg() {
		const svg = svgWrap.current?.querySelector("svg");
		if (!svg) return;
		const data = new XMLSerializer().serializeToString(svg);
		const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		triggerDownload(url, "qr-code.svg");
		URL.revokeObjectURL(url);
		toast.success("Downloaded SVG");
	}

	return (
		<div className="space-y-6">
			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">Text or URL</h2>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" onClick={() => setValue(SAMPLE)}>
							<SparklesIcon className="size-4" />
							Example
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setValue("")}
							disabled={!value}
						>
							<Trash2Icon className="size-4" />
							Clear
						</Button>
					</div>
				</header>
				<Textarea
					value={value}
					onChange={(event) => setValue(event.target.value)}
					placeholder="Enter a URL or any text to encode…"
					spellCheck={false}
					className="min-h-24 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
				/>
			</section>

			<div className="grid gap-6 lg:grid-cols-[1fr_auto]">
				<section className="bg-card rounded-xl border p-4 sm:p-5">
					<h2 className="mb-4 text-sm font-medium">Options</h2>
					<div className="flex flex-wrap items-end gap-4">
						<div className="space-y-1.5">
							<Label htmlFor="qr-level">Error correction</Label>
							<Select
								value={level}
								onValueChange={(v) => setLevel(v as Level)}
							>
								<SelectTrigger id="qr-level" className="w-44">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{LEVELS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="qr-color">Foreground</Label>
							<input
								id="qr-color"
								type="color"
								value={fgColor}
								onChange={(event) => setFgColor(event.target.value)}
								className="h-10 w-16 cursor-pointer rounded-md border bg-transparent"
							/>
						</div>
					</div>
					<div className="mt-4 flex flex-wrap gap-2">
						<Button variant="outline" onClick={downloadPng} disabled={!hasValue}>
							<DownloadIcon className="size-4" />
							PNG
						</Button>
						<Button variant="outline" onClick={downloadSvg} disabled={!hasValue}>
							<DownloadIcon className="size-4" />
							SVG
						</Button>
					</div>
				</section>

				<section className="bg-card flex items-center justify-center rounded-xl border p-6">
					{hasValue ? (
						<div ref={svgWrap} className="rounded-lg bg-white p-3">
							<QRCodeSVG
								value={value}
								size={220}
								level={level}
								fgColor={fgColor}
								bgColor="#ffffff"
								marginSize={2}
							/>
						</div>
					) : (
						<p className="text-muted-foreground max-w-48 text-center text-sm">
							Your QR code appears here as you type.
						</p>
					)}
				</section>
			</div>

			{/* Off-screen high-resolution canvas, used only to export a crisp PNG. */}
			{hasValue ? (
				<div
					ref={canvasWrap}
					aria-hidden
					className="pointer-events-none absolute -left-[9999px] top-0"
				>
					<QRCodeCanvas
						value={value}
						size={1024}
						level={level}
						fgColor={fgColor}
						bgColor="#ffffff"
						marginSize={2}
					/>
				</div>
			) : null}
		</div>
	);
}
