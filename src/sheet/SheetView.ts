import { STAT_NAMES } from "../lib/constants.ts"
import type { SheetData } from "./SheetData.ts"

export type SheetView = ReturnType<typeof createSheetView>

export type ExperienceView = SheetView["experiences"][number]

export function createSheetView(
	sheet: SheetData,
	updateSheet: (updater: (sheet: SheetData) => SheetData) => void,
) {
	function stringView(key: string) {
		const value = String(sheet.data[key] ?? "")

		const setValue = (newValue: string) => {
			updateSheet((sheet) => ({
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
				value,
				onChange: (event: { currentTarget: { value: string } }) => {
					setValue(event.currentTarget.value)
				},
			}),
		}
	}

	function numberView(key: string) {
		const value = Number(sheet.data[key]) || 0

		const setValue = (newValue: number) => {
			updateSheet((sheet) => ({
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
				value,
				onChange: (event: { currentTarget: { valueAsNumber: number } }) => {
					const parsed = event.currentTarget.valueAsNumber
					if (!isNaN(parsed)) {
						setValue(parsed)
					}
				},
			}),
		}
	}

	function booleanView(key: string, fallback = false) {
		const value = sheet.data[key] === 1 ? true : fallback

		const setValue = (newValue: boolean) => {
			updateSheet((sheet) => ({
				...sheet,
				data: {
					...sheet.data,
					[key]: newValue ? 1 : 0,
				},
			}))
		}

		return {
			value,
			setValue,
			bind: () => ({
				checked: value,
				onChange: (event: { currentTarget: { checked: boolean } }) => {
					setValue(event.currentTarget.checked)
				},
			}),
		}
	}

	const sheetView = {
		name: stringView("name"),
		pronouns: stringView("pronouns"),
		species: stringView("species"),
		concept: stringView("concept"),
		showSkills: booleanView("showSkills"),
		experiences: Array.from({ length: 5 })
			.map((_, experienceIndex) => `experiences:${experienceIndex}`)
			.map((key) => ({
				type: stringView(`${key}:type`),
				description: stringView(`${key}:description`),
				stats: new Map(
					STAT_NAMES.map((stat) => [stat, numberView(`${key}:stats:${stat}`)]),
				),
			})),
		swapExperiences(indexA: number, indexB: number) {
			updateSheet((sheet) => {
				const prefixA = `experiences:${indexA}:`
				const prefixB = `experiences:${indexB}:`
				const newData = { ...sheet.data }

				const entriesA: Record<string, string | number> = {}
				const entriesB: Record<string, string | number> = {}

				for (const [key, value] of Object.entries(newData)) {
					if (key.startsWith(prefixA)) {
						entriesA[key.slice(prefixA.length)] = value
						delete newData[key]
					} else if (key.startsWith(prefixB)) {
						entriesB[key.slice(prefixB.length)] = value
						delete newData[key]
					}
				}

				for (const [suffix, value] of Object.entries(entriesA)) {
					newData[`${prefixB}${suffix}`] = value
				}
				for (const [suffix, value] of Object.entries(entriesB)) {
					newData[`${prefixA}${suffix}`] = value
				}

				return { ...sheet, data: newData }
			})
		},
	}

	return sheetView
}
