type Game = {
	gameId: number,
	rank: number
}

type Player = {
	id: number
	name: string
}

async function post(path, body) {
	const response = await fetch(`http://localhost:80${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	})
	return response.json()
}

export async function savePlayerScore(score, playerId): Promise<Game> {
	return post('/game', { score, playerId })
}

export async function createPlayer(name): Promise<Player> {
	return post('/player', { name })
}