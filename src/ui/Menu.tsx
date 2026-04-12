import { Menu as BaseMenu } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { twMergeCallback } from "../common.ts"

export function MenuRoot(props: BaseMenu.Root.Props) {
	return <BaseMenu.Root {...props} />
}

export function MenuTrigger(props: BaseMenu.Trigger.Props) {
	return <BaseMenu.Trigger {...props} />
}

export interface MenuPanelProps
	extends
		BaseMenu.Popup.Props,
		Pick<
			BaseMenu.Positioner.Props,
			"side" | "sideOffset" | "align" | "alignOffset"
		> {}

export function MenuPanel({
	side,
	sideOffset = 8,
	align,
	alignOffset,
	className,
	...props
}: MenuPanelProps) {
	return (
		<BaseMenu.Portal>
			<BaseMenu.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
			>
				<BaseMenu.Popup
					{...props}
					className={twMergeCallback(
						"flex base-ui-transition-out:translate-y-0.5 flex-col gap-1 rounded border border-gray-700 bg-gray-800 p-1 base-ui-transition-out:opacity-0 transition",
						className,
					)}
				/>
			</BaseMenu.Positioner>
		</BaseMenu.Portal>
	)
}

export interface MenuItemProps extends BaseMenu.Item.Props {
	icon: string
}

export function MenuItem({
	children,
	icon,
	className,
	...props
}: MenuItemProps) {
	return (
		<BaseMenu.Item
			{...props}
			className={twMergeCallback(
				"focus-visible-outline flex h-10 cursor-default items-center gap-3 rounded px-3 text-gray-200 transition hover:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
		>
			<Icon icon={icon} className="-m-0.5 size-5" />
			<div>{children}</div>
		</BaseMenu.Item>
	)
}
