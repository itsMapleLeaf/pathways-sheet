import "./index.css"
import { Tabs } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { type } from "arktype"
import { useEffect, useState } from "react"
import { SheetData } from "./SheetData.ts"
import { SheetEditor } from "./SheetEditor.tsx"
import { MenuItem, MenuPanel, MenuRoot, MenuTrigger } from "./ui/Menu.tsx"
import { Tooltip } from "./ui/Tooltip.tsx"
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

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const data = params.get("data")
		if (!data) return

		try {
			const parsed = type("string.json.parse")
				.to(SheetData)
				.assert(decodeURIComponent(atob(data)))

			const id = crypto.randomUUID()
			setSheets((prev) => ({ ...prev, [id]: { ...parsed, id } }))
			setSelectedSheetId(id)
			window.history.replaceState({}, document.title, window.location.pathname)
		} catch (error) {
			alert(`Failed to load sheet from URL: ${error}`)
			console.error("Failed to load sheet from URL", { error, data })
		}
	}, [setSheets, setSelectedSheetId])

	function saveSheet(sheet: SheetData) {
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
				console.error("failed to import sheet", { error })
			}
		}

		input.click()
	}

	function getSheetLink(sheet: SheetData) {
		const json = JSON.stringify(sheet)
		const encoded = btoa(encodeURIComponent(json))
		return `${window.location.origin}${window.location.pathname}?data=${encoded}`
	}

	return (
		<div className="mx-auto flex max-w-screen-md flex-col gap-3 px-4 py-12">
			<div className="flex flex-wrap items-end">
				<h1 className="flex-1 font-extralight text-3xl text-stone-100">
					Pathways RPG
				</h1>

				<div className="flex justify-end gap-2">
					{currentSheet && (
						<>
							{/* <CopyButton
								tooltip="Copy sheet link to clipboard"
								content={getSheetLink(currentSheet)}
							/> */}

							<Tooltip content="Save current sheet as JSON file" side="bottom">
								<button
									type="button"
									className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800"
									onClick={() => saveSheet(currentSheet)}
								>
									<Icon icon="mingcute:save-2-fill" className="size-5" />
									<span className="sr-only">Save</span>
								</button>
							</Tooltip>
						</>
					)}

					<Tooltip
						content="Load sheet from JSON file (adds a new tab)"
						side="bottom"
					>
						<button
							type="button"
							className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800"
							onClick={loadSheet}
						>
							<Icon icon="mingcute:folder-open-fill" className="size-5" />
							<span className="sr-only">Load</span>
						</button>
					</Tooltip>
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

function CopyButton({
	tooltip,
	content,
	linkText = "Sheet Link",
}: {
	tooltip: React.ReactNode
	content: string
	linkText?: string
}) {
	const [copied, setCopied] = useState(false)
	const [tooltipOpen, setTooltipOpen] = useState(false)

	async function copy(content: string) {
		if (copied) return

		try {
			await navigator.clipboard.writeText(content)
			setCopied(true)
			setTooltipOpen(true)
			setTimeout(() => {
				setCopied(false)
				setTooltipOpen(false)
			}, 1000)
		} catch (error) {
			alert(`Failed to copy: ${error}`)
		}
	}

	return (
		<MenuRoot>
			<Tooltip
				content={copied ? "Copied!" : tooltip}
				side="bottom"
				open={tooltipOpen || copied}
				onOpenChange={setTooltipOpen}
			>
				<MenuTrigger className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800">
					<Icon
						icon={copied ? "mingcute:check-fill" : "mingcute:link-fill"}
						className="size-5"
					/>
					<span className="sr-only">Copy Link</span>
				</MenuTrigger>
			</Tooltip>

			<MenuPanel align="end">
				<MenuItem
					icon="mingcute:discord-fill"
					onClick={() => copy(`[${linkText}](${content})`)}
				>
					Discord Markdown
				</MenuItem>
				<MenuItem icon="mingcute:link-fill" onClick={() => copy(content)}>
					URL
				</MenuItem>
			</MenuPanel>
		</MenuRoot>
	)
}
