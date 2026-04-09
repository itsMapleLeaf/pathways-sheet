import {
	type ComponentProps,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useEffect,
	useId,
	useState,
} from "react"
import "./index.css"
import { Combobox, Popover } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { type } from "arktype"
import { range, sum } from "es-toolkit"
import { twMerge } from "tailwind-merge"

const PATHS = ["Force", "Avoidance", "Alignment", "Direction"]

const SKILLS = ["Strength", "Agility", "Precision", "Logic", "Presence"]

type StatBlock = { name: string; stats: string[] }

type SheetData = Record<string, string | number>

const storageKey = "sheetData"

type ExportedSheet = typeof ExportedSheet.inferOut
const ExportedSheet = type({
	data: "Record<string, string | number>",
})

export function App() {
	const [data, setData] = useState<SheetData>(() => {
		if (typeof window === "undefined") return {}

		try {
			const loaded = window.localStorage.getItem(storageKey)
			if (!loaded) return {}

			const parsed = ExportedSheet(JSON.parse(loaded))
			if (parsed instanceof type.errors) {
				console.warn("failed to load sheet data", parsed.summary)
				return {}
			}
			return parsed.data
		} catch (error) {
			console.warn("failed to load sheet data", error)
			return {}
		}
	})

	useEffect(() => {
		const saved: ExportedSheet = { data }
		window.localStorage.setItem(storageKey, JSON.stringify(saved))
	}, [data])

	const statBlocks: StatBlock[] = [
		{ name: "Paths", stats: PATHS },
		{ name: "Skills", stats: SKILLS },
	]

	function dataView(key: string) {
		return {
			value: data[key],
			setValue: (newValue: string | number) => {
				setData((data) => ({ ...data, [key]: newValue }))
			},
		}
	}

	function inputPropsForDataKey(key: string) {
		const view = dataView(key)
		return {
			value: view.value,
			onChange: (event: { currentTarget: { value: string } }) => {
				view.setValue(event.currentTarget.value)
			},
		}
	}

	function exportSheet() {
		const exported: ExportedSheet = {
			data,
		}
		const exportedJson = JSON.stringify(exported)

		const file = new Blob([exportedJson], {
			type: "application/json",
		})

		// biome-ignore lint/complexity/useLiteralKeys: data is a dict
		const name = String(data["name"] || "sheet").replaceAll(/[^a-z0-9-_]/gi, "")

		const anchor = document.createElement("a")
		anchor.href = URL.createObjectURL(file)
		anchor.download = `${name}.json`
		anchor.click()
	}

	function importSheet() {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "application/json"

		input.oninput = async () => {
			const [file] = input.files ?? []
			if (!file) return

			try {
				const parsed = type("string.json.parse")
					.to(ExportedSheet)
					.assert(await file.text())
				setData(parsed.data)
			} catch (error) {
				alert(`failed to import: ${error}`)
			}
		}

		input.click()
	}

	return (
		<div className="mx-auto grid max-w-screen-md gap-6 px-4 py-12">
			<div className="flex justify-end gap-2">
				<button
					type="button"
					className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800"
					onClick={exportSheet}
				>
					<Icon icon="mingcute:save-2-fill" className="size-5" />
					<span className="sr-only">Save</span>
				</button>

				<button
					type="button"
					className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800"
					onClick={importSheet}
				>
					<Icon icon="mingcute:folder-open-fill" className="size-5" />
					<span className="sr-only">Load</span>
				</button>
			</div>

			<section className="grid gap-3">
				<div className="grid auto-cols-fr grid-flow-col gap-3">
					<InputField
						label="Name"
						placeholder="Artemis"
						{...inputPropsForDataKey("name")}
					/>
					<InputField
						label="Pronouns"
						placeholder="they/them"
						{...inputPropsForDataKey("pronouns")}
					/>
				</div>
				<TextAreaField
					label="Concept"
					placeholder="An astronomical character!"
					rows={3}
					{...inputPropsForDataKey("concept")}
				/>
				<TextAreaField
					label="Notes"
					placeholder="Track other misc. info"
					rows={3}
					{...inputPropsForDataKey("notes")}
				/>
			</section>

			{statBlocks.map((block) => (
				<section className="grid gap-2" key={block.name}>
					<h2 className="font-light text-2xl">{block.name}</h2>
					<dl className="grid auto-cols-fr grid-flow-col gap-3">
						{block.stats.map((stat) => {
							const statTotal = sum(
								range(5).map((experienceIndex) => {
									const dataKey = `experiences:${experienceIndex}:stats:${stat}`
									const dataValue = Number(data[dataKey]) || 0
									return dataValue
								}),
							)

							return (
								<div
									key={stat}
									className="flex flex-col items-center gap-1.5 rounded border border-white/10 bg-white/5 p-3"
								>
									<dt className="font-bold text-2xl/none">{statTotal}</dt>
									<dd className="font-medium text-sm/none">{stat}</dd>
								</div>
							)
						})}
					</dl>
				</section>
			))}

			{/* <div className="flex flex-row gap-3">
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
			</div> */}

			<section className="grid gap-2">
				<h2 className="mt-4 font-light text-2xl">Experiences</h2>
				<div className="grid gap-8">
					{Array.from({ length: 5 }, (_, i) => i).map((experienceIndex) => (
						<div key={experienceIndex} className="grid grid-cols-3 gap-3">
							<SelectField
								label="Type"
								options={["Origin", "Resource", "Setback", "Bond", "Loss"]}
								placeholder="Choose a type"
								{...inputPropsForDataKey(`experiences:${experienceIndex}:type`)}
							/>

							{statBlocks.map((section) => {
								const previewItems = section.stats
									.map((stat) => {
										const dataKey = `experiences:${experienceIndex}:stats:${stat}`
										const dataValue = Number(data[dataKey]) || 0
										return dataValue > 0 ? (
											<span
												key={stat}
												className="rounded bg-white/10 px-1.5 py-1 font-medium text-[15px] leading-4"
											>
												{stat} {dataValue}
											</span>
										) : null
									})
									.filter(Boolean)

								return (
									<StatBlockField
										key={section.name}
										statBlock={section}
										previewText={
											previewItems.length > 0 ? (
												<span className="flex flex-wrap gap-1.5">
													{previewItems}
												</span>
											) : (
												<span className="opacity-40">{`Choose ${section.name.toLowerCase()}...`}</span>
											)
										}
										experienceIndex={experienceIndex}
										data={data}
										setData={setData}
									/>
								)
							})}

							<TextAreaField
								label="Description"
								placeholder="What happened in their life?"
								rows={3}
								className="col-span-full"
								{...inputPropsForDataKey(
									`experiences:${experienceIndex}:description`,
								)}
							/>
						</div>
					))}
				</div>
			</section>
		</div>
	)
}

function StatBlockField({
	statBlock,
	previewText,
	experienceIndex,
	data,
	setData,
}: {
	statBlock: StatBlock
	previewText: ReactNode
	experienceIndex: number
	data: Record<string, string | number>
	setData: Dispatch<SetStateAction<Record<string, string | number>>>
}) {
	return (
		<Field key={statBlock.name} label={statBlock.name}>
			<Popover.Root>
				<Popover.Trigger className="focus-visible-outline min-h-10 rounded border border-white/10 bg-white/5 px-3 py-2 text-start leading-6 transition hover:bg-white/10">
					<div className="flex items-center gap-1.5">
						<div className="flex-1">{previewText}</div>
						<Icon icon="mingcute:edit-2-fill" className="opacity-50" />
					</div>
				</Popover.Trigger>

				<Popover.Portal>
					<Popover.Backdrop />
					<Popover.Positioner sideOffset={12} align="start">
						<Popover.Popup className="min-w-44 rounded border border-stone-800 bg-stone-900 shadow-black/50 shadow-md transition data-ending-style:translate-y-1 data-starting-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:opacity-0">
							<div className="flex flex-col gap-1 p-1">
								{statBlock.stats.map((stat) => {
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
												className="focus-visible-outline h-10 flex-1 rounded px-3 pr-10 text-start transition hover:bg-white/10"
												onClick={increment}
											>
												{stat}: {dataValue}
											</button>

											<button
												type="button"
												data-visible={dataValue > 0 || undefined}
												className="focus-visible-outline absolute right-0 flex size-8 items-center justify-center self-center whitespace-nowrap rounded-full font-medium leading-none opacity-50 transition-all hover:bg-white/10 data-visible:opacity-100"
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
}

interface FieldProps extends ComponentProps<"div"> {
	label: ReactNode
}

function Field({ className, label, id, children, ...props }: FieldProps) {
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
			className={twMerge("flex flex-col gap-1", className)}
			{...props}
		>
			<Combobox.Root>
				<Combobox.InputGroup className="flex flex-wrap gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 leading-6 transition-colors focus:border-fuchsia-400/50 focus:bg-white/10 focus:outline-none">
					{options.map((opt) => (
						<button
							key={opt}
							type="button"
							className="rounded border border-white/20 bg-white/10 px-1 font-medium text-sm"
						>
							{opt}
						</button>
					))}

					<Combobox.Input
						id={id}
						type="text"
						className="min-w-32 flex-1 focus:outline-none"
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
				className="rounded border border-white/10 bg-white/5 px-3 py-2 leading-6 transition-colors focus:border-fuchsia-400/50 focus:bg-white/10 focus:outline-none"
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
				className="field-sizing-content rounded border border-white/10 bg-white/5 px-3 py-2 leading-6 transition-colors focus:border-fuchsia-400/50 focus:bg-white/10 focus:outline-none"
				{...props}
			/>
		</Field>
	)
}

interface SelectFieldProps extends ComponentProps<"select"> {
	label: ReactNode
	options: ReadonlyArray<string | { label: string; value: string }>
	placeholder?: string
}

function SelectField({
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
