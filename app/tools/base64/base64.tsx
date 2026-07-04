import { useDeferredValue, useMemo, useState } from "react";

import {
	type CodecMode,
	CodecPanel,
	ToggleField,
} from "../shared/codec-panel";
import { DEFAULT_OPTIONS, base64 } from "./transform";

const SAMPLE = "Hello, World! café 😀";

export function Base64() {
	const [mode, setMode] = useState<CodecMode>("encode");
	const [input, setInput] = useState("");
	const [urlSafe, setUrlSafe] = useState(false);

	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => base64(deferredInput, mode, { urlSafe }),
		[deferredInput, mode, urlSafe],
	);
	const isStale = deferredInput !== input;

	return (
		<CodecPanel
			mode={mode}
			onModeChange={setMode}
			input={input}
			onInput={setInput}
			result={result}
			isStale={isStale}
			sample={SAMPLE}
			inputPlaceholder={
				mode === "encode"
					? "Type or paste text to encode…"
					: "Paste Base64 to decode…"
			}
			options={
				<ToggleField
					id="url-safe"
					label="URL-safe"
					hint="Use the -_ alphabet and drop = padding, for Base64 in URLs and filenames."
					checked={urlSafe}
					onCheckedChange={setUrlSafe}
				/>
			}
		/>
	);
}
