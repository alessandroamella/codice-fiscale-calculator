import type { ReactNode } from "react";
import Select, { type Props as SelectProps } from "react-select";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { cn } from "../../lib/utils";

interface Option {
	value: string;
	label: string;
}

interface VirtualizedMenuListProps {
	options: Option[];
	children: ReactNode[];
	maxHeight: number;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	getValue: () => { [key: string]: any };
}

const ITEM_HEIGHT = 35;

const VirtualizedMenuList = ({
	options,
	children,
	maxHeight,
	getValue,
}: VirtualizedMenuListProps) => {
	const value = getValue()[0];
	const initialOffset =
		options.findIndex((option) => option === value) * ITEM_HEIGHT;

	if (!children.length) {
		return (
			<div className="p-2 text-sm text-center text-muted-foreground">
				No options available
			</div>
		);
	}

	return (
		<div style={{ height: Math.min(maxHeight, children.length * ITEM_HEIGHT) }}>
			<AutoSizer disableHeight>
				{({ width }) => (
					<List
						width={width}
						height={Math.min(maxHeight, children.length * ITEM_HEIGHT)}
						itemCount={children.length}
						itemSize={ITEM_HEIGHT}
						initialScrollOffset={initialOffset}
					>
						{({ index, style }) => <div style={style}>{children[index]}</div>}
					</List>
				)}
			</AutoSizer>
		</div>
	);
};

interface VirtualizedSelectProps<T extends Option>
	extends Omit<SelectProps<T, false>, "menuListComponent"> {
	className?: string;
	defaultValue?: T;
}

export default function VirtualizedSelect<T extends Option>({
	className,
	defaultValue,
	...props
}: VirtualizedSelectProps<T>) {
	return (
		<Select
			defaultValue={defaultValue}
			classNames={{
				container: () => "text-foreground",
				control: (state) =>
					cn(
						"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
						state.isFocused && "ring-2 ring-ring ring-offset-2 border-input",
						state.isDisabled && "cursor-not-allowed opacity-50",
						className,
					),
				placeholder: () => "text-muted-foreground",
				input: () => "text-foreground",
				valueContainer: () => "gap-1",
				singleValue: () => "text-foreground",
				multiValue: () =>
					"bg-secondary text-secondary-foreground rounded-md py-1 px-2 flex gap-1 items-center",
				multiValueLabel: () => "text-sm",
				multiValueRemove: () =>
					"rounded-md hover:bg-destructive hover:text-destructive-foreground",
				indicatorsContainer: () => "gap-1",
				dropdownIndicator: () => "p-1 hover:text-primary text-muted-foreground",
				clearIndicator: () => "p-1 hover:text-primary text-muted-foreground",
				indicatorSeparator: () => "bg-border",
				menu: () =>
					"relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1",
				menuList: () => "py-1",
				option: ({ isDisabled, isFocused, isSelected }) =>
					cn(
						"flex cursor-default select-none items-center px-3 py-1.5 text-sm",
						!isDisabled && isFocused && "bg-accent text-accent-foreground",
						isSelected && "bg-primary text-primary-foreground",
						isDisabled && "text-muted-foreground opacity-50",
					),
				noOptionsMessage: () => "text-muted-foreground p-2 text-sm",
				loadingMessage: () => "text-muted-foreground p-2 text-sm",
				loadingIndicator: () => "text-primary",
				groupHeading: () =>
					"text-muted-foreground text-xs px-3 py-1.5 font-semibold",
			}}
			unstyled
			components={{
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				MenuList: VirtualizedMenuList as any,
				...props.components,
			}}
			theme={(theme) => ({
				...theme,
				borderRadius: 4,
				colors: {
					...theme.colors,
					neutral0: "var(--background)",
					neutral5: "var(--border)",
					neutral10: "var(--input)",
					neutral20: "var(--border)",
					neutral30: "var(--border)",
					neutral40: "var(--muted-foreground)",
					neutral50: "var(--muted-foreground)",
					neutral60: "var(--foreground)",
					neutral70: "var(--foreground)",
					neutral80: "var(--foreground)",
					neutral90: "var(--foreground)",
					primary: "var(--primary)",
					primary25: "var(--accent)",
					primary50: "var(--accent)",
					primary75: "var(--primary)",
				},
			})}
			{...props}
		/>
	);
}
