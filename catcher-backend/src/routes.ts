import { NextFunction, Request, Response, Router } from 'express'
import { createGame, createPlayer, getLeaderboard } from './services'

const router = Router()

function catchErrors(handler: (req: Request, res: Response, next: NextFunction) => void) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next)
        } catch (error : any) {
            // Check if the error has a custom status code
            const errorCode = error.statusCode || 500
            const message = error.message || 'Internal Server Error'
            res.status(errorCode).json({ error: message })
        }
    }
}

router.get('/leaderboard', catchErrors(async (request: Request, response: Response) => {
    // get leaderboard from redis
    const leaderboard = await getLeaderboard()
    response.json(leaderboard)
}))

router.post('/player', catchErrors(async (request: Request, response: Response) => {
    const { name } = request.body
    const { id, name: playerName } = await createPlayer(name)
    response.json({ id, name: playerName })
}))

router.post('/game', catchErrors(async (request: Request, response: Response) => {
    const { playerId, score } = request.body
    response.json(await createGame(playerId, score))
}))

export default router