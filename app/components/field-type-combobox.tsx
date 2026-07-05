import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { FIELD_CATEGORIES, FIELD_TYPES, getFieldType } from "@/lib/faker-fields";
import { cn } from "@/lib/utils";

/**
 * A searchable dropdown for picking a Faker field type. Shared by the Fake
 * Value and Mock Data generators so both stay consistent. Search matches the
 * label, id, and category so "mail", "email", or "internet" all find Email.
 */
export function FieldTypeCombobox({
	value,
	onChange,
	id,
	triggerClassName,
}: {
	value: string;
	onChange: (value: string) => void;
	id?: string;
	triggerClassName?: string;
}) {
	const [open, setOpen] = useState(false);
	const selected = getFieldType(value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("justify-between font-normal", triggerClassName)}
				>
					<span className="truncate">{selected.label}</span>
					<ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-(--radix-popover-trigger-width) min-w-56 p-0"
			>
				<Command>
					<CommandInput placeholder="Search types…" />
					<CommandList>
						<CommandEmpty>No type found.</CommandEmpty>
						{FIELD_CATEGORIES.map((category) => (
							<CommandGroup key={category} heading={category}>
								{FIELD_TYPES.filter((field) => field.category === category).map(
									(field) => (
										<CommandItem
											key={field.id}
											// Include id + category so search matches all three.
											value={`${field.label} ${field.id} ${category}`}
											onSelect={() => {
												onChange(field.id);
												setOpen(false);
											}}
										>
											<CheckIcon
												className={cn(
													"size-4",
													value === field.id ? "opacity-100" : "opacity-0",
												)}
											/>
											{field.label}
										</CommandItem>
									),
								)}
							</CommandGroup>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
