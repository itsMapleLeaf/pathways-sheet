import { type } from "arktype"

export type SheetData = typeof SheetData.inferOut
export const SheetData = type({
	id: type("string").default(() => crypto.randomUUID()),
	data: "Record<string, string | number>",
})
