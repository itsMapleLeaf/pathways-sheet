import "./index.css"
import { Tabs } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { type } from "arktype"
import { useCallback, useEffect, useEffectEvent, useState } from "react"
import { createGitHubGist, fetchGitHubGist } from "./lib/gist.ts"
import { useLocalStorage } from "./lib/useLocalStorage.ts"
import { SheetData } from "./sheet/SheetData.ts"
import { SheetEditor } from "./sheet/SheetEditor.tsx"
import { Tooltip } from "./ui/Tooltip.tsx"

const SheetDataFromJsonString = type("string.json.parse").to(SheetData)

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
				const parsed = SheetDataFromJsonString.assert(await file.text())

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

	async function createShareLink(sheet: SheetData) {
		const json = JSON.stringify(sheet)
		const gist = await createGitHubGist({
			description: "Shared from Pathways RPG Sheet Editor",
			files: {
				"sheet.json": {
					content: json,
				},
			},
			public: false,
		})
		return `${window.location.origin}${window.location.pathname}?shareId=${gist.id}`
	}

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const gistId = params.get("shareId")
		if (!gistId) return

		void (async () => {
			try {
				const gist = await fetchGitHubGist(gistId)
				const file = gist.files["sheet.json"]
				if (!file) {
					throw new Error("Gist does not contain sheet.json")
				}

				const parsed = SheetDataFromJsonString.assert(file.content)

				const id = crypto.randomUUID()

				setSheets((prev) => ({ ...prev, [id]: { ...parsed, id } }))
				setSelectedSheetId(id)

				window.history.replaceState(
					{},
					document.title,
					window.location.pathname,
				)
			} catch (error) {
				alert(`Failed to load sheet from URL: ${error}`)
				console.error("Failed to load sheet from URL", { error, gistId })
			}
		})()
	}, [setSheets, setSelectedSheetId])

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
								tooltip="Create share link"
								createShareLink={() => createShareLink(currentSheet)}
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
	createShareLink,
}: {
	tooltip: React.ReactNode
	createShareLink: () => Promise<string>
}) {
	const [copied, setCopied] = useState(false)
	const [tooltipOpen, setTooltipOpen] = useState(false)

	const [copy, copyState] = useAsyncState(async () => {
		if (copied) return

		try {
			const link = await createShareLink()
			await navigator.clipboard.writeText(link)

			setCopied(true)
			setTooltipOpen(true)

			setTimeout(() => {
				setCopied(false)
				setTooltipOpen(false)
			}, 2000)
		} catch (error) {
			alert(`Failed to copy: ${error}`)
		}
	})

	return (
		<Tooltip
			content={copied ? "Copied!" : tooltip}
			side="bottom"
			open={tooltipOpen || copied}
			onOpenChange={setTooltipOpen}
		>
			<button
				type="button"
				className="flex size-8 items-center justify-center rounded transition hover:bg-stone-800"
				onClick={copy}
			>
				<Icon
					icon={
						copyState.status === "pending"
							? "mingcute:loading-3-fill"
							: copied
								? "mingcute:check-fill"
								: "mingcute:link-fill"
					}
					data-pending={copyState.status === "pending" || undefined}
					className="size-5 data-pending:animate-spin"
				/>
				<span className="sr-only">{tooltip}</span>
			</button>
		</Tooltip>
	)
}

type AsyncState<T> =
	| { status: "idle" }
	| { status: "pending" }
	| { status: "success"; data: T }
	| { status: "error"; error: unknown }

function useAsyncState<Args extends unknown[], Return>(
	func: (...args: Args) => Return | Promise<Return>,
) {
	const [state, setState] = useState<AsyncState<Return>>({ status: "idle" })

	const runCallback = useEffectEvent(async (...args: Args) => {
		if (state.status === "pending") return

		setState({ status: "pending" })

		try {
			const result = await func(...args)
			setState({ status: "success", data: result })
		} catch (error) {
			setState({ status: "error", error })
		}
	})

	const runCallbackMemo = useCallback((...args: Args) => {
		runCallback(...args)
	}, [])

	return [runCallbackMemo, state] as const
}
