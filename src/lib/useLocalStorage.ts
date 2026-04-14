import { type ArkErrors, type } from "arktype"
import { useEffect, useEffectEvent, useLayoutEffect, useState } from "react"

export function useLocalStorage<T>({
	key,
	fallback,
	schema,
}: {
	key: string
	fallback: T
	schema: (input: unknown) => T | ArkErrors
}) {
	const [state, setState] = useState<T>(fallback)
	const [loaded, setLoaded] = useState(false)

	const load = useEffectEvent(() => {
		try {
			const loaded = window.localStorage.getItem(key)
			if (!loaded) return fallback

			const parsed = schema(JSON.parse(loaded))
			if (parsed instanceof type.errors) {
				console.warn("failed to load sheet data", parsed.summary)
				return fallback
			}
			return parsed
		} catch (error) {
			console.warn("failed to load sheet data", error)
			return fallback
		} finally {
			setLoaded(true)
		}
	})

	useLayoutEffect(() => {
		setState(load())
	}, [])

	useEffect(() => {
		if (!loaded) return
		window.localStorage.setItem(key, JSON.stringify(state))
	}, [loaded, key, state])

	return [state, setState] as const
}
