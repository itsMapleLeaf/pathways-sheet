import { startCase } from "es-toolkit"

export const PATHS = ["Force", "Avoidance", "Alignment", "Direction"]

export const SKILLS = ["Strength", "Agility", "Precision", "Logic", "Presence"]

export type StatBlock = { name: string; stats: string[] }
export const STAT_BLOCKS: StatBlock[] = [
	{ name: "Paths", stats: PATHS },
	{ name: "Skills", stats: SKILLS },
]

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
				if (
					(PATHS.includes(statName) || SKILLS.includes(statName)) &&
					typeof v === "number"
				) {
					return [[statName, v]]
				}
				return []
			}),
		),
	}),
)

export const SPECIES_MAP = new Map(SPECIES_LIST.map((it) => [it.name, it]))
