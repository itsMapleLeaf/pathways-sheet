import { useId, useState, type ComponentProps, type ReactNode } from "react"
import "./index.css"
import { twMerge } from "tailwind-merge"
import { Combobox, Popover } from "@base-ui/react"
import { Icon } from "@iconify/react"

const PATHS = ["Force", "Avoidance", "Alignment", "Direction"]

const SKILLS = ["Strength", "Agility", "Precision", "Logic", "Presence"]

export function App() {
	const [data, setData] = useState<Record<string, string | number>>({})

	return (
		<div className="grid gap-6 mx-auto max-w-screen-md px-4 py-12">
			<section className="grid gap-3">
				<div className="gap-3 grid grid-flow-col auto-cols-fr">
					<InputField label="Name" placeholder="Artemis" />
					<InputField label="Pronouns" placeholder="they/them" />
				</div>
				<TextAreaField
					label="Concept"
					placeholder="An astronomical character!"
					rows={3}
				/>
			</section>

			<section className="grid gap-2">
				<h2 className="text-2xl font-light">Paths</h2>
				<div className="grid grid-flow-col auto-cols-fr gap-3">
					{PATHS.map((path, index) => (
						<div
							key={path}
							className="bg-white/5 border border-white/10 p-3 gap-1.5 rounded flex flex-col items-center"
						>
							<div className="text-2xl/none font-bold">{index}</div>
							<div className="text-sm/none font-medium">{path}</div>
						</div>
					))}
				</div>
			</section>

			<section className="grid gap-2">
				<h2 className="text-2xl font-light">Skills</h2>
				<div className="grid grid-flow-col auto-cols-fr gap-3">
					{SKILLS.map((skill, index) => (
						<div
							key={skill}
							className="bg-white/5 border border-white/10 p-3 gap-1.5 rounded flex flex-col items-center"
						>
							<div className="text-2xl/none font-bold">{index}</div>
							<div className="text-sm/none font-medium">{skill}</div>
						</div>
					))}
				</div>
			</section>

			<div className="flex flex-row gap-3">
				<section className="flex flex-col gap-2 flex-1">
					<h2 className="text-2xl font-light">Paths</h2>
					<div className="grid gap-3 flex-1">
						{PATHS.map((path, index) => (
							<div
								key={path}
								className="bg-white/5 border border-white/10 gap-1.5 rounded flex"
							>
								<div className="flex-1 px-3 font-medium flex items-center text-lg">
									{path}
								</div>
								<div className="bg-black/25 py-3 px-6 text-2xl/none font-bold flex items-center">
									{index}
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="flex flex-col gap-2 flex-1">
					<h2 className="text-2xl font-light">Skills</h2>
					<div className="grid gap-3 flex-1">
						{SKILLS.map((skill, index) => (
							<div
								key={skill}
								className="bg-white/5 border border-white/10 gap-1.5 rounded flex"
							>
								<div className="flex-1 px-3 font-medium flex items-center text-lg">
									{skill}
								</div>
								<div className="bg-black/25 py-3 px-6 text-2xl/none font-bold flex items-center">
									{index}
								</div>
							</div>
						))}
					</div>
				</section>
			</div>

			<section className="grid gap-2">
				<h2 className="text-2xl font-light mt-4">Experiences</h2>
				<div className="grid gap-8">
					{Array.from({ length: 5 }, (_, i) => i).map((experienceIndex) => (
						<div key={experienceIndex} className="grid gap-3 grid-cols-2">
							<SelectField
								label="Type"
								options={["Origin", "Resource", "Setback", "Bond", "Loss"]}
								className="col-span-full"
							/>
							<TextAreaField
								label="Description"
								placeholder="What happened in their life?"
								rows={3}
								className="col-span-full"
							/>

							{/* <TagField label="Paths" placeholder="Type a path..." /> */}

							{[
								{ name: "Paths", stats: PATHS },
								{ name: "Skills", stats: SKILLS },
							].map((section) => {
								const previewText = section.stats
									.map((stat) => {
										const dataKey = `experiences:${experienceIndex}:stats:${stat}`
										const dataValue = Number(data[dataKey]) || 0
										return dataValue > 0 ? `${stat} ${dataValue}` : null
									})
									.filter(Boolean)
									.join(", ") || (
									<span className="opacity-40">{`Choose ${section.name.toLowerCase()}...`}</span>
								)

								return (
									<Field key={section.name} label={section.name}>
										<Popover.Root>
											<Popover.Trigger className="leading-6 h-10 py-2 text-start px-3 bg-white/5 border border-white/10 rounded transition hover:bg-white/10 focus-visible-outline">
												<div className="flex items-center">
													<div className="flex-1">{previewText}</div>
													<Icon
														icon="mingcute:edit-2-fill"
														className="opacity-50"
													/>
												</div>
											</Popover.Trigger>

											<Popover.Portal>
												<Popover.Backdrop />
												<Popover.Positioner sideOffset={12} align="start">
													<Popover.Popup className="bg-stone-900 border border-stone-800 rounded shadow-md shadow-black/50 transition data-starting-style:translate-y-1 data-ending-style:translate-y-1 data-starting-style:opacity-0 data-ending-style:opacity-0">
														<div className="flex flex-col gap-1 p-1">
															{section.stats.map((stat) => {
																const dataKey = `experiences:${experienceIndex}:stats:${stat}`
																const dataValue = Number(data[dataKey]) || 0

																const increment = () => {
																	setData((data) => {
																		const current = Number(data[dataKey]) || 0
																		return { ...data, [dataKey]: current + 1 }
																	})
																}

																const decrement = () => {
																	setData((data) => {
																		const current = Number(data[dataKey]) || 0
																		return {
																			...data,
																			[dataKey]: Math.max(0, current - 1),
																		}
																	})
																}

																return (
																	<div key={stat} className="relative flex">
																		<button
																			type="button"
																			className="h-10 px-3 pr-10 flex-1 text-start rounded transition hover:bg-white/10 focus-visible-outline"
																			onClick={increment}
																		>
																			{stat}: {dataValue}
																		</button>

																		<button
																			type="button"
																			data-visible={dataValue > 0 || undefined}
																			className="absolute right-0 self-center flex items-center justify-center rounded-full size-8 font-medium leading-none whitespace-nowrap transition hover:bg-white/10 opacity-0 data-visible:opacity-100 focus-visible-outline"
																			onClick={decrement}
																		>
																			<Icon
																				icon="mingcute:minimize-fill"
																				className="size-4"
																			/>
																		</button>
																	</div>
																)
															})}
														</div>
													</Popover.Popup>
												</Popover.Positioner>
											</Popover.Portal>
										</Popover.Root>
									</Field>
								)
							})}
						</div>
					))}
				</div>
			</section>
		</div>
	)
}

interface FieldProps extends ComponentProps<"div"> {
	label: ReactNode
}

function Field({ className, label, id, children, ...props }: FieldProps) {
	const Label = id ? "label" : "div"
	return (
		<div className={twMerge("flex flex-col gap-1", className)}>
			<Label htmlFor={id} className="text-sm font-medium">
				{label}
			</Label>
			{children}
		</div>
	)
}

interface TagFieldProps extends ComponentProps<"div"> {
	label: ReactNode
	placeholder: string
}

function TagField({ className, label, placeholder, ...props }: TagFieldProps) {
	const id = useId()

	const options = PATHS

	return (
		<Field
			label={label}
			id={id}
			className={twMerge("flex flex-col gap-1 ", className)}
			{...props}
		>
			<Combobox.Root>
				<Combobox.InputGroup className="bg-white/5 border-white/10 leading-6 py-2 px-3 rounded border focus:bg-white/10 focus:border-fuchsia-400/50 transition-colors focus:outline-none flex gap-2 flex-wrap">
					{options.map((opt) => (
						<button
							key={opt}
							type="button"
							className="rounded bg-white/10 border border-white/20 px-1 text-sm font-medium"
						>
							{opt}
						</button>
					))}

					<Combobox.Input
						id={id}
						type="text"
						className="flex-1 min-w-32 focus:outline-none placeholder-shown:text-white/40"
						placeholder={placeholder}
					/>
				</Combobox.InputGroup>
			</Combobox.Root>

			<Combobox.Portal>
				<Combobox.Positioner>
					<Combobox.Popup>
						<Combobox.List></Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Field>
	)
}

interface InputFieldProps extends ComponentProps<"input"> {
	label: ReactNode
}

function InputField({ className, label, ...props }: InputFieldProps) {
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
				className="bg-white/5 border-white/10 leading-6 py-2 px-3 rounded border focus:bg-white/10 focus:border-fuchsia-400/50 transition-colors focus:outline-none placeholder-shown:text-white/40"
				{...props}
			/>
		</Field>
	)
}

interface TextAreaFieldProps extends ComponentProps<"textarea"> {
	label: ReactNode
}

function TextAreaField({ className, label, ...props }: TextAreaFieldProps) {
	const id = useId()
	return (
		<Field
			label={label}
			id={id}
			className={twMerge("flex flex-col gap-1", className)}
		>
			<textarea
				id={id}
				className="bg-white/5 border-white/10 py-2 leading-6 px-3 rounded border focus:bg-white/10 focus:border-fuchsia-400/50 transition-colors focus:outline-none placeholder-shown:text-white/40 field-sizing-content"
				{...props}
			/>
		</Field>
	)
}

interface SelectFieldProps extends ComponentProps<"select"> {
	label: ReactNode
	options: ReadonlyArray<string | { label: string; value: string }>
}

function SelectField({
	className,
	label,
	options,
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
				className="bg-stone-900 border-white/10 focus:border-fuchsia-400/50 py-2 leading-6 px-3 rounded border transition-colors focus:outline-none placeholder-shown:text-white/40 field-sizing-content"
				{...props}
			>
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
