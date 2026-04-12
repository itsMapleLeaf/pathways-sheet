import "./index.css"
import { Tabs } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { type } from "arktype"
import { SheetData } from "./SheetData.ts"
import { SheetEditor } from "./SheetEditor.tsx"
import { useLocalStorage } from "./useLocalStorage.ts"

const fallbackSheetId = crypto.randomUUID()

export function App() {
	const [sheets, setSheets] = useLocalStorage({
		key: "sheets",
		schema: type.Record("string", SheetData),
		fallback: {
			[fallbackSheetId]: { id: fallbackSheetId, data: {} },
		},
	})

	const [selectedSheetId, setSelectedSheetId] = useLocalStorage({
		key: "selectedSheetId",
		schema: type("string | null"),
		fallback: null,
	})

	const currentSheetId =
		selectedSheetId && selectedSheetId in sheets
			? selectedSheetId
			: Object.keys(sheets)[0]

	const currentSheet = currentSheetId && sheets[currentSheetId]

	function saveSheet() {
		const sheet = currentSheet
		if (!sheet) {
			alert("no sheet to save")
			return
		}

		console.debug("exported sheet", sheet)

		const exportedJson = JSON.stringify(sheet)

		const file = new Blob([exportedJson], {
			type: "application/json",
		})

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

				const id = crypto.randomUUID()
				setSheets((prev) => ({ ...prev, [id]: { ...parsed, id } }))
				setSelectedSheetId(id)
			} catch (error) {
				alert(`failed to import: ${error}`)
			}
		}

		input.click()
	}

	return (
		<div className="mx-auto flex max-w-screen-md flex-col gap-3 px-4 py-12">
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

			<Tabs.Root
				className="contents"
				value={currentSheetId ?? null}
				onValueChange={setSelectedSheetId}
			>
				<Tabs.List className="flex flex-wrap gap-1">
					{Object.values(sheets).map((sheet) => (
						<div key={sheet.id} className="relative">
							<Tabs.Tab
								value={sheet.id}
								className="focus-visible-outline peer h-9 w-40 rounded px-2.5 text-start opacity-75 transition hover:bg-stone-800 hover:opacity-100 data-active:bg-stone-800 data-active:pr-8 data-active:opacity-100"
							>
								{sheet.data["name"] ?? (
									<div className="max-w-full truncate text-stone-400 italic">
										Unnamed Character
									</div>
								)}
							</Tabs.Tab>

							<div className="pointer-events-none absolute inset-y-0 right-0 hidden aspect-square items-center justify-center peer-data-active:flex">
								<button
									type="button"
									className="focus-visible-outline pointer-events-auto rounded p-1 opacity-75 transition hover:bg-stone-700 hover:opacity-100"
									onClick={() => {
										if (
											!confirm("Are you sure you want to remove this sheet?")
										) {
											return
										}

										setSheets((prev) => {
											const { [sheet.id]: _, ...rest } = prev
											return rest
										})

										if (currentSheetId === sheet.id) {
											setSelectedSheetId(null)
										}
									}}
								>
									<Icon icon="mingcute:close-fill" className="size-3" />
									<span className="sr-only">Close Tab</span>
								</button>
							</div>
						</div>
					))}

					<button
						type="button"
						className="focus-visible-outline flex aspect-square h-9 items-center justify-center rounded opacity-75 transition hover:bg-stone-800 hover:opacity-100"
						onClick={() => {
							const id = crypto.randomUUID()
							setSheets((prev) => ({ ...prev, [id]: { id, data: {} } }))
							setSelectedSheetId(id)
						}}
					>
						<Icon icon="mingcute:add-fill" className="size-4" />
						<span className="sr-only">New Tab</span>
					</button>
				</Tabs.List>

				{Object.values(sheets).map((sheet) => (
					<Tabs.Panel key={sheet.id} value={sheet.id}>
						<SheetEditor
							sheet={sheet}
							updateSheet={(getNew) => {
								setSheets((prev) => {
									const current = prev[sheet.id] ?? { id: sheet.id, data: {} }
									return { ...prev, [sheet.id]: getNew(current) }
								})
							}}
						/>
					</Tabs.Panel>
				))}
			</Tabs.Root>
		</div>
	)
}
