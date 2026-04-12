import { startCase } from "es-toolkit"

const EXPERIENCE_COUNT = 5

type ExperienceType = {
	name: string
	prompts: Record<string, string> // a prompt for each stat block, to help the player define which stats apply
}
export const EXPERIENCE_TYPES: ExperienceType[] = [
	{
		name: "Environment",
		prompts: {
			Paths: "How did you act in this environment?",
			Skills: "Which skills were improved?",
		},
	},
	{
		name: "Resource",
		prompts: {
			Paths: "Which paths did you take in acquiring this?",
			Skills: "Which skills did this resource give you?",
		},
	},
	{
		name: "Setback",
		prompts: {
			Paths: "How did you act in this setback?",
			Skills: "Which skills did you use to get through it?",
		},
	},
	{
		name: "Bond",
		prompts: {
			Paths: "How did you act towards them?",
			Skills: "Which skills did they teach you?",
		},
	},
	{
		name: "Loss",
		prompts: {
			Paths: "How did this loss make you act?",
			Skills: "Which skills did this loss strengthen?",
		},
	},
]

const PATHS_PER_EXPERIENCE = 3
const SKILLS_PER_EXPERIENCE = 2

const SPECIES_PATH_COUNT = 3
const SPECIES_SKILL_COUNT = 2

export type StatBlock = {
	name: string
	stats: string[]
	requiredCountInExperiences: number
	requiredTotal: number
}

export const STAT_BLOCKS: StatBlock[] = [
	{
		name: "Paths",
		stats: ["Force", "Direction", "Avoidance", "Alignment"],
		requiredCountInExperiences: PATHS_PER_EXPERIENCE,
		requiredTotal: EXPERIENCE_COUNT * PATHS_PER_EXPERIENCE + SPECIES_PATH_COUNT,
	},
	{
		name: "Skills",
		stats: ["Strength", "Logic", "Agility", "Precision", "Presence"],
		requiredCountInExperiences: SKILLS_PER_EXPERIENCE,
		requiredTotal:
			EXPERIENCE_COUNT * SKILLS_PER_EXPERIENCE + SPECIES_SKILL_COUNT,
	},
]

export const STAT_NAMES = STAT_BLOCKS.flatMap(({ stats }) => stats)

export type SpeciesData = {
	name: string
	force: number
	direction: number
	avoidance: number
	alignment: number
	strength: number
	agility: number
	precision: number
	logic: number
	presence: number
	statMap: Map<string, number>
}

export const SPECIES_LIST: SpeciesData[] = [
	{
		name: "Aquatic",
		force: 0,
		direction: 0,
		avoidance: 1,
		alignment: 2,
		strength: 0,
		agility: 1,
		precision: 0,
		logic: 1,
		presence: 0,
	},
	{
		name: "Avian",
		force: 0,
		direction: 2,
		avoidance: 1,
		alignment: 0,
		strength: 0,
		agility: 1,
		precision: 0,
		logic: 0,
		presence: 1,
	},
	{
		name: "Canine",
		force: 1,
		direction: 1,
		avoidance: 0,
		alignment: 1,
		strength: 1,
		agility: 1,
		precision: 0,
		logic: 0,
		presence: 0,
	},
	{
		name: "Cervid",
		force: 0,
		direction: 1,
		avoidance: 2,
		alignment: 0,
		strength: 0,
		agility: 0,
		precision: 0,
		logic: 1,
		presence: 1,
	},
	{
		name: "Demonic",
		force: 0,
		direction: 1,
		avoidance: 1,
		alignment: 1,
		strength: 0,
		agility: 0,
		precision: 0,
		logic: 0,
		presence: 2,
	},
	{
		name: "Draconic",
		force: 1,
		direction: 2,
		avoidance: 0,
		alignment: 0,
		strength: 2,
		agility: 0,
		precision: 0,
		logic: 0,
		presence: 0,
	},
	{
		name: "Feline",
		force: 2,
		direction: 0,
		avoidance: 1,
		alignment: 0,
		strength: 0,
		agility: 2,
		precision: 0,
		logic: 0,
		presence: 0,
	},
	{
		name: "Flora",
		force: 0,
		direction: 0,
		avoidance: 1,
		alignment: 2,
		strength: 0,
		agility: 0,
		precision: 0,
		logic: 2,
		presence: 0,
	},
	{
		name: "Leporid",
		force: 0,
		direction: 0,
		avoidance: 2,
		alignment: 1,
		strength: 1,
		agility: 0,
		precision: 1,
		logic: 0,
		presence: 0,
	},
	{
		name: "Murid",
		force: 1,
		direction: 0,
		avoidance: 2,
		alignment: 0,
		strength: 0,
		agility: 0,
		precision: 2,
		logic: 0,
		presence: 0,
	},
	{
		name: "Musteloid",
		force: 2,
		direction: 0,
		avoidance: 0,
		alignment: 1,
		strength: 0,
		agility: 1,
		precision: 1,
		logic: 0,
		presence: 0,
	},
	{
		name: "Ursine",
		force: 1,
		direction: 0,
		avoidance: 0,
		alignment: 2,
		strength: 1,
		agility: 0,
		precision: 0,
		logic: 0,
		presence: 1,
	},
].map(
	(data): SpeciesData => ({
		...data,
		statMap: new Map(
			Object.entries(data).flatMap(([k, v]) => {
				const statName = startCase(k)
				if (STAT_NAMES.includes(statName) && typeof v === "number") {
					return [[statName, v]]
				}
				return []
			}),
		),
	}),
)

export const SPECIES_MAP = new Map(SPECIES_LIST.map((it) => [it.name, it]))
