export async function createGitHubGist(params: {
	files: Record<string, { content: string }>
	description?: string
	public?: boolean
}) {
	const response = await fetch("https://api.github.com/gists", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	})

	if (!response.ok) {
		throw new Error(`Failed to create gist: ${response.statusText}`)
	}

	return (await response.json()) as {
		id: string
		html_url: string
	}
}

export async function fetchGitHubGist(gistId: string) {
	const response = await fetch(`https://api.github.com/gists/${gistId}`)

	if (!response.ok) {
		throw new Error(`Failed to fetch gist: ${response.statusText}`)
	}

	return (await response.json()) as {
		id: string
		files: Record<
			string,
			{
				filename: string
				type: string
				language: string
				raw_url: string
				size: number
				content: string
			}
		>
	}
}
