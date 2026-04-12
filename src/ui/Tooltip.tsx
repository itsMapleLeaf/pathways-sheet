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

export interface TooltipContentProps
	extends
		BaseTooltip.Popup.Props,
		Pick<
			BaseTooltip.Positioner.Props,
			"side" | "sideOffset" | "align" | "alignOffset"
		> {}

export function TooltipContent({
	side,
	sideOffset = 8,
	align,
	alignOffset,
	className,
	...props
}: TooltipContentProps) {
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

export interface TooltipProps extends Except<TooltipContentProps, "content"> {
	content: React.ReactNode
}

/**
 * A convenience wrapper around the tooltip primitives
 *
 * @example
 * <Tooltip content="This is a tooltip">
 *   <button>Hover me</button>
 * </Tooltip>
 */
export function Tooltip({ content, ...props }: TooltipProps) {
	return (
		<TooltipRoot>
			<TooltipTrigger>{props.children}</TooltipTrigger>
			<TooltipContent {...props}>{content}</TooltipContent>
		</TooltipRoot>
	)
}
