import { type ClassNameValue, twMerge } from "tailwind-merge"

export function twMergeCallback<Args extends readonly unknown[]>(
	...classes: (ClassNameValue | ((...args: Args) => ClassNameValue))[]
) {
	return (...args: Args) =>
		twMerge(
			classes.map((cls) => (typeof cls === "function" ? cls(...args) : cls)),
		)
}
