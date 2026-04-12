/// <reference types="@total-typescript/ts-reset" />

import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import { TooltipProvider } from "./ui/Tooltip.tsx"

function start() {
	const root = createRoot(document.getElementById("root") as HTMLElement)
	root.render(
		<TooltipProvider>
			<App />
		</TooltipProvider>,
	)
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", start)
} else {
	start()
}
