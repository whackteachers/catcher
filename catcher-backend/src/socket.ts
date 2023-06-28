import { Server, Socket } from 'socket.io'
import { getLeaderboard } from './services'
import * as http from 'http'

let io: Server

export async function emitLeaderboardUpdate() {
    io.emit('leaderboard', await getLeaderboard())
}
export function initializeSocket(server: http.Server): void {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', async (socket: Socket) => {
        console.log('A client connected')

        await emitLeaderboardUpdate()

        socket.on('disconnect', () => {
            console.log('A client disconnected')
        })
    })
}