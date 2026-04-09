import { type } from "arktype"

export type SheetData = typeof SheetData.inferOut
export const SheetData = type({
	data: "Record<string, string | number>",
})
