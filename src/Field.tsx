import { type ComponentProps, type ReactNode, useId } from "react"
import { twMerge } from "tailwind-merge"

export interface FieldProps extends ComponentProps<"div"> {
	label: ReactNode
}

export function Field({
	className,
	label,
	id,
	children,
	...props
}: FieldProps) {
	const Label = id ? "label" : "div"
	return (
		<div className={twMerge("flex flex-col gap-1", className)} {...props}>
			<Label htmlFor={id} className="font-medium text-sm">
				{label}
			</Label>
			{children}
		</div>
	)
}

export interface InputFieldProps extends ComponentProps<"input"> {
	label: ReactNode
}

export function InputField({ className, label, ...props }: InputFieldProps) {
	const id = useId()
	return (
		<Field
			label={label}
			id={id}
			className={twMerge("flex flex-col gap-1", className)}
		>
			<input
				id={id}
				type="text"
				className="rounded border border-white/10 bg-white/5 px-3 py-2 leading-6 transition-colors focus:border-fuchsia-400/50 focus:bg-white/10 focus:outline-none"
				{...props}
			/>
		</Field>
	)
}

export interface TextAreaFieldProps extends ComponentProps<"textarea"> {
	label: ReactNode
}

export function TextAreaField({
	className,
	label,
	...props
}: TextAreaFieldProps) {
	const id = useId()
	return (
		<Field
			label={label}
			id={id}
			className={twMerge("flex flex-col gap-1", className)}
		>
			<textarea
				id={id}
				className="field-sizing-content rounded border border-white/10 bg-white/5 px-3 py-2 leading-6 transition-colors focus:border-fuchsia-400/50 focus:bg-white/10 focus:outline-none"
				{...props}
			/>
		</Field>
	)
}

export interface SelectFieldProps extends ComponentProps<"select"> {
	label: ReactNode
	options: ReadonlyArray<string | { label: string; value: string }>
	placeholder?: string
}

export function SelectField({
	className,
	label,
	options,
	placeholder,
	...props
}: SelectFieldProps) {
	const id = useId()
	return (
		<Field
			label={label}
			id={id}
			className={twMerge("flex flex-col gap-1", className)}
		>
			<select
				id={id}
				data-muted={!props.value || undefined}
				className="field-sizing-content rounded border border-white/10 bg-stone-900 px-3 py-2 leading-6 transition-colors focus:border-fuchsia-400/50 focus:outline-none"
				{...props}
			>
				{placeholder && <option value="">{placeholder}</option>}
				{options
					.map((it) => (typeof it === "string" ? { label: it, value: it } : it))
					.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
			</select>
		</Field>
	)
}
