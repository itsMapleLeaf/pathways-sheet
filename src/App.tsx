import "./index.css"
import { Icon } from "@iconify/react"
import { type } from "arktype"
import { SheetData } from "./SheetData.ts"
import { SheetEditor } from "./SheetEditor.tsx"
import { useLocalStorage } from "./useLocalStorage.ts"

export function App() {
	const [sheet, setSheet] = useLocalStorage({
		key: "sheetData",
		fallback: { data: {} },
		schema: SheetData,
	})

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

	return (
		<div className="mx-auto max-w-screen-md px-4 py-12">
			<div className="mb-3 flex flex-wrap items-end">
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

			<SheetEditor sheet={sheet} setSheet={setSheet} />
		</div>
	)
}
