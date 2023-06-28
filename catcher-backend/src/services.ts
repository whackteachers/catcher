import { Player } from './entities/player'
import { gameRepository, playerRepository } from './db'
import { In, Like } from 'typeorm'
import _ from 'lodash'
import { Game } from './entities/game'
import { emitLeaderboardUpdate } from './socket'
import { InvalidParameterException } from './exceptions'
import { redis } from './redis'

type LeaderboardRecord = Pick<Player, 'id' | 'name'> & Pick<Game, 'score'>
type Leaderboard = LeaderboardRecord[]

export async function getLeaderboard(k = 100): Promise<Leaderboard> {
    const scores = await redis.zrevrange('leaderboard', 0, k - 1, 'WITHSCORES')
    if (_.isEmpty(scores)) {
        // get leaderboard from database in case redis lost data
        const data = await gameRepository.createQueryBuilder('leaderboard')
            .select('MAX(leaderboard.score)', 'score')
            .addSelect('leaderboard.playerId', 'id')
            .addSelect('p.name', 'name')
            .innerJoin(Player, 'p', 'leaderboard.playerId = p.id')
            .groupBy('leaderboard.playerId')
            .orderBy('score', 'DESC')
            .getRawMany()
        if (_.isEmpty(data)) {
            return []
        }
        await redis.zadd(
            'leaderboard',
            ...data.flatMap(({ score, id }) => [score, id])
        )
        return data
    }
    const leaderboardData = _.chunk(scores, 2)

    const playerIds = leaderboardData.map(([id, ]) => parseInt(id))

    const players = await playerRepository.find({
        where: { id: In(playerIds) },
        cache: true
    })

    return leaderboardData.map(([playerId, score]): LeaderboardRecord => {
        const id = parseInt(playerId)
        const player = _.find(players, { id })
        return {
            id,
            name: _.get(player, 'name', 'Unknown'),
            score: parseInt(score),
        }
    })
}

export async function createPlayer(name: string): Promise<Player> {
    if (!name) {
        throw new InvalidParameterException('name is required')
    }
    if (await playerRepository.findOneBy({ name })) {
        const similarCount = await playerRepository.count({ where: { name: Like(`${name}%`) }})
        name = `${name}_${similarCount}`
    }
    return playerRepository.save({ name })
}

export async function createGame(playerId: number, score: number) {
    if (!playerId || !score) {
        throw new InvalidParameterException('please input playerId and score')
    }
    // add score only if score is higher than current score
    const currentScore = Number(await redis.zscore('leaderboard', playerId))
    if (currentScore < score) {
        await redis.zadd('leaderboard', score, playerId)
    }
    // add a game
    const { id: gameId } = await gameRepository.save({ score, player: { id: playerId } })
    const rank = await redis.zrevrank('leaderboard', playerId)
    if (rank !== null && rank < 100) {
        await emitLeaderboardUpdate()
    }
    return {
        gameId,
        rank: rank !== null ? rank + 1 : null,
    }
}