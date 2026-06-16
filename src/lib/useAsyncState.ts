import { useCallback, useEffectEvent, useState } from "react"

type AsyncState<T> =
	| { status: "idle" }
	| { status: "pending" }
	| { status: "success"; data: T }
	| { status: "error"; error: unknown }

export function useAsyncState<Args extends unknown[], Return>(
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
