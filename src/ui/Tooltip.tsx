import { Tooltip as BaseTooltip } from "@base-ui/react"
import type { Except } from "type-fest"
import { twMergeCallback } from "../common.ts"

export function TooltipProvider(props: BaseTooltip.Provider.Props) {
	return <BaseTooltip.Provider delay={300} {...props} />
}

export function TooltipRoot(props: BaseTooltip.Root.Props) {
	return <BaseTooltip.Root {...props} />
}

export function TooltipTrigger(props: BaseTooltip.Trigger.Props) {
	return <BaseTooltip.Trigger {...props} />
}

export interface TooltipPanelProps
	extends
		BaseTooltip.Popup.Props,
		Pick<
			BaseTooltip.Positioner.Props,
			"side" | "sideOffset" | "align" | "alignOffset"
		> {}

export function TooltipPanel({
	side,
	sideOffset = 8,
	align,
	alignOffset,
	className,
	...props
}: TooltipPanelProps) {
	return (
		<BaseTooltip.Portal>
			<BaseTooltip.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
			>
				<BaseTooltip.Popup
					{...props}
					className={twMergeCallback(
						"base-ui-transition-out:translate-y-0.5 rounded bg-white p-1 font-medium text-gray-900 text-sm/4 base-ui-transition-out:opacity-0 transition",
						className,
					)}
				/>
			</BaseTooltip.Positioner>
		</BaseTooltip.Portal>
	)
}

export interface TooltipProps extends Except<TooltipPanelProps, "content"> {
	content: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

/**
 * A convenience wrapper around the tooltip primitives
 *
 * @example
 * <Tooltip content="This is a tooltip">
 *   <button>Hover me</button>
 * </Tooltip>
 */
export function Tooltip({
	content,
	open,
	onOpenChange,
	...props
}: TooltipProps) {
	return (
		<TooltipRoot open={open} onOpenChange={onOpenChange}>
			<TooltipTrigger>{props.children}</TooltipTrigger>
			<TooltipPanel {...props}>{content}</TooltipPanel>
		</TooltipRoot>
	)
}
