import "./index.css"
import { Icon } from "@iconify/react"
import { type } from "arktype"
import { sum, sumBy } from "es-toolkit"
import {
	PATHS,
	SKILLS,
	SPECIES_LIST,
	SPECIES_MAP,
	STAT_BLOCKS,
} from "./constants.ts"
import { InputField, SelectField, TextAreaField } from "./Field.tsx"
import { SheetData } from "./SheetData.ts"
import { StatBlockField } from "./StatBlockField.tsx"
import { useLocalStorage } from "./useLocalStorage.ts"

export function App() {
	const [sheet, setSheet] = useLocalStorage({
		key: "sheetData",
		fallback: { data: {} },
		schema: SheetData,
	})

	function dataView(key: string) {
		const value = sheet.data[key]

		const setValue = (newValue: string | number) => {
			setSheet((sheet) => ({
				...sheet,
				data: {
					...sheet.data,
					[key]: newValue,
				},
			}))
		}

		return {
			value,
			setValue,
			bind: () => ({
				value: value,
				onChange: (event: { currentTarget: { value: string } }) => {
					setValue(event.currentTarget.value)
				},
			}),
		}
	}

	function saveSheet() {
		console.debug("exported sheet", sheet)

		const exportedJson = JSON.stringify(sheet)

		const file = new Blob([exportedJson], {
			type: "application/json",
		})

		// biome-ignore lint/complexity/useLiteralKeys: data is a dict
		const name = String(sheet.data["name"] || "sheet").replaceAll(
			/[^a-z0-9-_]/gi,
			"",
		)

		const anchor = document.createElement("a")
		anchor.href = URL.createObjectURL(file)
		anchor.download = `${name}.json`
		anchor.click()
	}

	function loadSheet() {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "application/json"

		input.oninput = async () => {
			const [file] = input.files ?? []
			if (!file) return

			try {
				const parsed = type("string.json.parse")
					.to(SheetData)
					.assert(await file.text())
				setSheet(parsed)
			} catch (error) {
				alert(`failed to import: ${error}`)
			}
		}

		input.click()
	}

	const sheetView = {
		name: dataView("name"),
		pronouns: dataView("pronouns"),
		species: dataView("species"),
		concept: dataView("concept"),
		experiences: Array.from({ length: 5 })
			.map((_, experienceIndex) => `experiences:${experienceIndex}`)
			.map((key) => ({
				type: dataView(`${key}:type`),
				description: dataView(`${key}:description`),
				stats: new Map(
					[...PATHS, ...SKILLS].map((stat) => [
						stat,
						dataView(`${key}:stats:${stat}`),
					]),
				),
			})),
	}

	const speciesData = SPECIES_MAP.get(sheetView.species.value as string)

	const getStatValue = (stat: string) =>
		sum([
			...sheetView.experiences.map(
				(experienceView) => Number(experienceView.stats.get(stat)?.value) || 0,
			),
			speciesData?.statMap.get(stat) ?? 0,
		])

	return (
		<div className="mx-auto grid max-w-screen-md gap-6 px-4 py-12">
			<div className="flex flex-wrap items-end">
				<h1 className="flex-1 font-extralight text-3xl text-stone-100">
					Pathways RPG
				</h1>

				<div className="flex justify-end gap-2">
					<button
						type="button"
						className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800"
						onClick={saveSheet}
					>
						<Icon icon="mingcute:save-2-fill" className="size-5" />
						<span className="sr-only">Save</span>
					</button>
					<button
						type="button"
						className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800"
						onClick={loadSheet}
					>
						<Icon icon="mingcute:folder-open-fill" className="size-5" />
						<span className="sr-only">Load</span>
					</button>
				</div>
			</div>

			<section className="grid gap-4">
				<div className="grid auto-cols-fr grid-flow-col gap-3">
					<InputField
						label="Name"
						placeholder="Artemis"
						{...sheetView.name.bind()}
					/>
					<InputField
						label="Pronouns"
						placeholder="they/them"
						{...sheetView.pronouns.bind()}
					/>
				</div>

				<section className="flex flex-col gap-2">
					<SelectField
						label="Species"
						options={SPECIES_LIST.map((species) => species.name)}
						placeholder="Choose a species"
						{...sheetView.species.bind()}
					/>

					<div className="grid auto-cols-fr grid-flow-col">
						{STAT_BLOCKS.map((block) => {
							const statEntries = block.stats
								.map((stat) => {
									const value = speciesData?.statMap.get(stat) ?? 0
									return [stat, value] as const
								})
								.filter(([, value]) => value != 0)

							if (statEntries.length < 1) return

							return (
								<div key={block.name} className="flex flex-col gap-1">
									<h2 className="font-medium text-sm/5">{block.name}</h2>
									<div className="flex flex-wrap gap-1">
										{statEntries.map(([stat, value]) => (
											<p
												key={stat}
												className="badge border border-gray-700"
											>{`${stat} ${value}`}</p>
										))}
									</div>
								</div>
							)
						})}
					</div>
				</section>

				<TextAreaField
					label="Concept / Notes"
					placeholder="An astronomical character!"
					rows={3}
					{...sheetView.concept.bind()}
				/>
			</section>

			{STAT_BLOCKS.map((block) => {
				const blockTotal = sumBy(block.stats, getStatValue)

				return (
					<section className="grid gap-2" key={block.name}>
						<h2 className="font-light text-2xl">
							{block.name}
							{blockTotal !== block.requiredTotal &&
								` (${blockTotal}/${block.requiredTotal})`}
						</h2>
						<dl className="grid auto-cols-fr grid-flow-col gap-3">
							{block.stats.map((stat) => {
								return (
									<div
										key={stat}
										className="flex flex-col items-center gap-1.5 rounded border border-white/10 bg-white/5 p-3"
									>
										<dt className="font-bold text-2xl/none">
											{getStatValue(stat)}
										</dt>
										<dd className="font-medium text-sm/none">{stat}</dd>
									</div>
								)
							})}
						</dl>
					</section>
				)
			})}

			<section className="grid gap-2">
				<h2 className="mt-4 font-light text-2xl">Experiences</h2>
				<div className="grid gap-8">
					{sheetView.experiences.map((experienceView, experienceIndex) => (
						<div key={experienceIndex} className="grid grid-cols-3 gap-3">
							<SelectField
								label="Type"
								options={["Origin", "Resource", "Setback", "Bond", "Loss"]}
								placeholder="Choose a type"
								{...experienceView.type.bind()}
							/>

							{STAT_BLOCKS.map((section) => {
								const previewItems = section.stats
									.map((stat) => {
										const dataValue =
											Number(experienceView.stats.get(stat)?.value) || 0

										return dataValue > 0 ? (
											<span key={stat} className="badge">
												{stat} {dataValue}
											</span>
										) : null
									})
									.filter(Boolean)

								return (
									<StatBlockField
										key={section.name}
										statBlock={section}
										requiredCount={section.requiredCountInExperiences}
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
										sheet={sheet}
										onSheetChange={setSheet}
									/>
								)
							})}

							<TextAreaField
								label="Description"
								placeholder="What happened in their life?"
								rows={3}
								className="col-span-full"
								{...experienceView.description.bind()}
							/>
						</div>
					))}
				</div>
			</section>
		</div>
	)
}
