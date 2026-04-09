import { Popover } from "@base-ui/react"
import { Icon } from "@iconify/react"
import type { Dispatch, ReactNode, SetStateAction } from "react"
import type { StatBlock } from "./constants.ts"
import { Field } from "./Field.tsx"
import type { SheetData } from "./SheetData.ts"

export function StatBlockField({
	statBlock,
	previewText,
	experienceIndex,
	sheet,
	onSheetChange,
}: {
	statBlock: StatBlock
	previewText: ReactNode
	experienceIndex: number
	sheet: SheetData
	onSheetChange: Dispatch<SetStateAction<SheetData>>
}) {
	return (
		<Field label={statBlock.name}>
			<Popover.Root>
				<Popover.Trigger className="focus-visible-outline min-h-10 rounded border border-white/10 bg-white/5 px-3 py-2 text-start leading-6 transition hover:bg-white/10">
					<div className="flex items-center gap-1.5">
						<div className="flex-1">{previewText}</div>
						<Icon icon="mingcute:edit-2-fill" className="opacity-50" />
					</div>
				</Popover.Trigger>

				<Popover.Portal>
					<Popover.Backdrop />
					<Popover.Positioner sideOffset={12} align="start">
						<Popover.Popup className="min-w-44 rounded border border-stone-800 bg-stone-900 shadow-black/50 shadow-md transition data-ending-style:translate-y-1 data-starting-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:opacity-0">
							<div className="flex flex-col gap-1 p-1">
								{statBlock.stats.map((stat) => {
									const dataKey = `experiences:${experienceIndex}:stats:${stat}`
									const value = Number(sheet.data[dataKey]) || 0

									const onIncrement = () => {
										onSheetChange((data) => {
											const current = Number(data.data[dataKey]) || 0
											return { ...data, [dataKey]: current + 1 }
										})
									}

									const onDecrement = () => {
										onSheetChange((data) => {
											const current = Number(data.data[dataKey]) || 0
											return {
												...data,
												[dataKey]: Math.max(0, current - 1),
											}
										})
									}

									return (
										<div key={stat} className="relative flex">
											<button
												type="button"
												className="focus-visible-outline h-10 flex-1 rounded px-3 pr-10 text-start transition hover:bg-white/10"
												onClick={onIncrement}
											>
												{stat}: {value}
											</button>

											<button
												type="button"
												data-visible={value > 0 || undefined}
												className="focus-visible-outline absolute right-0 flex size-8 items-center justify-center self-center whitespace-nowrap rounded-full font-medium leading-none opacity-50 transition-all hover:bg-white/10 data-visible:opacity-100"
												onClick={onDecrement}
											>
												<Icon
													icon="mingcute:minimize-fill"
													className="size-4"
												/>
											</button>
										</div>
									)
								})}
							</div>
						</Popover.Popup>
					</Popover.Positioner>
				</Popover.Portal>
			</Popover.Root>
		</Field>
	)
}
