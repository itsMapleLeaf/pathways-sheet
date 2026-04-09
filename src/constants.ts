export const PATHS = ["Force", "Avoidance", "Alignment", "Direction"]

export const SKILLS = ["Strength", "Agility", "Precision", "Logic", "Presence"]

export type StatBlock = { name: string; stats: string[] }
export const STAT_BLOCKS: StatBlock[] = [
	{ name: "Paths", stats: PATHS },
	{ name: "Skills", stats: SKILLS },
]
