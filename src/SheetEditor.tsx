import { Popover } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { sum, sumBy } from "es-toolkit"
import { twMerge } from "tailwind-merge"
import {
	EXPERIENCE_TYPES,
	SPECIES_LIST,
	SPECIES_MAP,
	STAT_BLOCKS,
} from "./constants.ts"
import { Field, InputField, SelectField, TextAreaField } from "./Field.tsx"
import type { SheetData } from "./SheetData.ts"
import { createSheetView, type ExperienceView } from "./SheetView.ts"

const statStyles: Record<string, string> = {
	Force: twMerge("border-red-700/50 bg-red-800/40 text-red-200"),
	Direction: twMerge("border-yellow-700/50 bg-yellow-800/40 text-yellow-200"),
	Avoidance: twMerge("border-green-700/50 bg-green-800/40 text-green-200"),
	Alignment: twMerge("border-blue-700/50 bg-blue-800/40 text-blue-200"),
	Strength: twMerge("border-red-700/50 bg-red-800/40 text-red-200"),
	Agility: twMerge("border-green-700/50 bg-green-800/40 text-green-200"),
	Precision: twMerge("border-blue-700/50 bg-blue-800/40 text-blue-200"),
	Logic: twMerge("border-yellow-700/50 bg-yellow-800/40 text-yellow-200"),
	Presence: twMerge("border-purple-700/50 bg-purple-800/40 text-purple-200"),
}

export function SheetEditor({
	sheet,
	setSheet,
}: {
	sheet: SheetData
	setSheet: React.Dispatch<React.SetStateAction<SheetData>>
}) {
	const sheetView = createSheetView(sheet, setSheet)
	const speciesData = SPECIES_MAP.get(sheetView.species.value as string)

	const getStatValue = (stat: string) =>
		sum([
			...sheetView.experiences.map(
				(experienceView) => Number(experienceView.stats.get(stat)?.value) || 0,
			),
			speciesData?.statMap.get(stat) ?? 0,
		])

	return (
		<div className="grid gap-6">
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
				<TextAreaField
					label="Concept / Notes"
					placeholder="An astronomical character!"
					rows={3}
					{...sheetView.concept.bind()}
				/>
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
												className={twMerge(
													"badge border border-gray-700",
													statStyles[stat],
												)}
											>{`${stat} ${value}`}</p>
										))}
									</div>
								</div>
							)
						})}
					</div>
				</section>
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
							{block.stats.map((stat) => (
								<div
									key={stat}
									className={twMerge(
										"flex flex-col items-center gap-1.5 rounded border border-white/10 bg-white/5 p-3",
										statStyles[stat],
									)}
								>
									<dt className="font-bold text-2xl/none">
										{getStatValue(stat)}
									</dt>
									<dd className="font-medium text-sm/none">{stat}</dd>
								</div>
							))}
						</dl>
					</section>
				)
			})}
			<section className="grid gap-2">
				<h2 className="mb-2 font-light text-2xl">Experiences</h2>
				<div className="grid gap-8">
					{sheetView.experiences.map((experienceView, experienceIndex) => (
						<ExperienceRow
							key={experienceIndex}
							experienceView={experienceView}
						/>
					))}
				</div>
			</section>
		</div>
	)
}

function ExperienceRow({ experienceView }: { experienceView: ExperienceView }) {
	const experienceTypePrompts = EXPERIENCE_TYPES.find(
		(type) => type.name === experienceView.type.value,
	)?.prompts

	return (
		<div className="flex flex-col gap-2 border-gray-800 not-first:border-t not-first:pt-8">
			<TextAreaField
				label="Description"
				placeholder="What happened in their life?"
				rows={3}
				className="col-span-full"
				{...experienceView.description.bind()}
			/>

			<SelectField
				label="Type"
				options={EXPERIENCE_TYPES.map((type) => type.name)}
				placeholder="Choose a type"
				{...experienceView.type.bind()}
			/>

			<div className="flex gap-2 *:flex-1">
				{STAT_BLOCKS.map((section) => {
					const prompt = experienceTypePrompts?.[section.name]
					return (
						<div key={section.name} className="flex flex-col gap-1">
							<ExperienceStatField
								section={section}
								experienceView={experienceView}
							/>
							{prompt && <p className="text-gray-400 italic">{prompt}</p>}
						</div>
					)
				})}
			</div>
		</div>
	)
}

function ExperienceStatField({
	section,
	experienceView,
}: {
	section: (typeof STAT_BLOCKS)[number]
	experienceView: ExperienceView
}) {
	const experienceTotal = sumBy(
		section.stats,
		(stat) => experienceView.stats.get(stat)?.value ?? 0,
	)

	const fieldLabel = `${section.name}${totalDisplayedWhenMismatched(
		experienceTotal,
		section.requiredCountInExperiences,
	)}`

	return (
		<Field key={section.name} label={fieldLabel}>
			<Popover.Root>
				<Popover.Trigger className="focus-visible-outline min-h-10 rounded border border-white/10 bg-white/5 p-2 text-start leading-6 transition hover:bg-white/10">
					<div className="flex items-center gap-1.5">
						<div className="flex flex-1 flex-wrap gap-1">
							{section.stats.map((stat) => {
								const dataValue = experienceView.stats.get(stat)?.value ?? 0
								return dataValue !== 0 ? (
									<span
										key={stat}
										className={twMerge("badge", statStyles[stat])}
									>
										{stat} {dataValue}
									</span>
								) : null
							})}
						</div>
						<Icon icon="mingcute:edit-2-fill" className="opacity-50" />
					</div>
				</Popover.Trigger>

				<Popover.Portal>
					<Popover.Backdrop />
					<Popover.Positioner sideOffset={12} align="start">
						<Popover.Popup className="min-w-44 rounded border border-stone-800 bg-stone-900 shadow-black/50 shadow-md transition data-ending-style:translate-y-1 data-starting-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:opacity-0">
							<div className="flex flex-col gap-1 p-1">
								{section.stats.map((stat) => {
									const statView = experienceView.stats.get(stat)
									const statValue = statView?.value ?? 0

									const onIncrement = () => {
										statView?.setValue(statValue + 1)
									}

									const onDecrement = () => {
										statView?.setValue(statValue - 1)
									}

									return (
										<div key={stat} className="relative flex">
											<button
												type="button"
												className="focus-visible-outline absolute left-0 flex size-8 items-center justify-center self-center whitespace-nowrap rounded-full font-medium leading-none transition-all hover:bg-white/10"
												onClick={onDecrement}
											>
												<Icon icon="mingcute:left-fill" className="size-4" />
												<span className="sr-only">Decrement</span>
											</button>

											<button
												type="button"
												className="focus-visible-outline h-10 flex-1 rounded px-8 text-start transition hover:bg-white/10"
												onClick={onIncrement}
												onContextMenu={(event) => {
													event.preventDefault()
													onDecrement()
												}}
											>
												{stat}: {statValue}
											</button>

											<button
												type="button"
												className="focus-visible-outline absolute right-0 flex size-8 items-center justify-center self-center whitespace-nowrap rounded-full font-medium leading-none transition-all hover:bg-white/10"
												onClick={onIncrement}
											>
												<Icon icon="mingcute:right-fill" className="size-4" />
												<span className="sr-only">Increment</span>
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

function totalDisplayedWhenMismatched(total: number, requiredTotal: number) {
	return total !== requiredTotal ? ` (${total}/${requiredTotal})` : ""
}
