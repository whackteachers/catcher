jest.mock('../src/db', () => ({
	playerRepository: {
		find: jest.fn(),
		findOneBy: jest.fn(),
		count: jest.fn(),
		save: jest.fn()
	},
	gameRepository: {
		createQueryBuilder: jest.fn(),
		save: jest.fn()
	}
}))

jest.mock('../src/redis', () => ({
	redis: {
		zrevrange: jest.fn(),
		zadd: jest.fn(),
		zscore: jest.fn(),
		zrevrank: jest.fn(),
	}
}))

import { InvalidParameterException } from '../src/exceptions'
import { createGame, createPlayer, getLeaderboard } from '../src/services'
import { gameRepository, playerRepository } from '../src/db'
import { redis } from '../src/redis'
import * as socket from '../src/socket'

describe('services', () => {

	describe('getLeaderboard', () => {
		afterEach(() => {
			jest.restoreAllMocks()
		})

		it('should fetch leaderboard from Redis when available', async () => {
			jest.spyOn(redis, 'zrevrange').mockResolvedValue(['1', '100', '2', '90'])
			jest.spyOn(playerRepository, 'find').mockResolvedValue([
				{ id: 1, name: 'Player 1' },
				{ id: 2, name: 'Player 2' }
			] as any)

			const leaderboard = await getLeaderboard()

			expect(redis.zrevrange).toHaveBeenCalledWith('leaderboard', 0, 99, 'WITHSCORES')
			expect(playerRepository.find).toHaveBeenCalled()
			expect(leaderboard).toEqual([
				{ id: 1, name: 'Player 1', score: 100 },
				{ id: 2, name: 'Player 2', score: 90 },
			])
		})

		it('should fetch leaderboard from the database when Redis data is empty', async () => {
			jest.spyOn(redis, 'zrevrange').mockResolvedValue([])
			jest.spyOn(gameRepository, 'createQueryBuilder').mockReturnValue({
				select: jest.fn().mockReturnThis(),
				addSelect: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				getRawMany: jest.fn().mockResolvedValue([
					{ score: 100, id: 1, name: 'Player 1' },
					{ score: 90, id: 2, name: 'Player 2' }
				])
			} as any)
			jest.spyOn(playerRepository, 'find').mockResolvedValue([
				{ id: 1, name: 'Player 1' },
				{ id: 2, name: 'Player 2' }
			] as any)

			const leaderboard = await getLeaderboard()

			expect(redis.zrevrange).toHaveBeenCalledWith('leaderboard', 0, 99, 'WITHSCORES')
			expect(redis.zadd).toHaveBeenCalledWith(
				'leaderboard',
				100,
				1,
				90,
				2
			)
			expect(gameRepository.createQueryBuilder).toHaveBeenCalled()
			expect(leaderboard).toEqual([
				{id: 1, name: 'Player 1', score: 100},
				{id: 2, name: 'Player 2', score: 90},
			])
		})
	})

	describe('createPlayer', () => {
		afterEach(() => {
			jest.restoreAllMocks()
		})

		it('should create a player with a unique name', async () => {
			jest.spyOn(playerRepository, 'findOneBy').mockResolvedValue(null)
			jest.spyOn(playerRepository, 'save').mockResolvedValueOnce({id: 1, name: 'John'} as any)

			const name = 'John'

			const result = await createPlayer(name)

			expect(playerRepository.findOneBy).toHaveBeenCalledWith({name})
			expect(playerRepository.save).toHaveBeenCalledWith({name})
			expect(result).toEqual({id: 1, name: 'John'})
		})

		it('should create a player with a modified name if a similar name exists', async () => {
			jest.spyOn(playerRepository, 'findOneBy').mockResolvedValue({id: 1, name: 'John'} as any)
			jest.spyOn(playerRepository, 'count').mockResolvedValue(1)
			jest.spyOn(playerRepository, 'save').mockResolvedValueOnce({id: 2, name: 'John_1'} as any)

			const name = 'John'

			const result = await createPlayer(name)

			expect(playerRepository.findOneBy).toHaveBeenCalledWith({name})
			expect(playerRepository.count).toHaveBeenCalled()
			expect(playerRepository.save).toHaveBeenCalledWith({name: 'John_1'})
			expect(result).toEqual({id: 2, name: 'John_1'})
		})

		it('should throw an error if name is not provided', async () => {
			await expect(createPlayer('')).rejects.toThrow(InvalidParameterException)
		})
	})

	describe('createGame', () => {
		afterEach(() => {
			jest.restoreAllMocks()
		})

		it('should create a game and update the leaderboard if rank is within top 100', async () => {
			const playerId = 1
			const score = 1000
			jest.spyOn(redis, 'zscore').mockResolvedValueOnce('0')
			jest.spyOn(gameRepository, 'save').mockResolvedValueOnce({id: playerId} as any)
			jest.spyOn(redis, 'zrevrank').mockResolvedValueOnce(10)
			jest.spyOn(socket, 'emitLeaderboardUpdate').mockImplementation()

			const result = await createGame(playerId, score)

			expect(redis.zscore).toHaveBeenCalledWith('leaderboard', playerId)
			expect(redis.zadd).toHaveBeenCalledWith('leaderboard', score, playerId)
			expect(gameRepository.save).toHaveBeenCalledWith({score: score, player: {id: playerId}})
			expect(redis.zrevrank).toHaveBeenCalledWith('leaderboard', playerId)
			expect(socket.emitLeaderboardUpdate).toHaveBeenCalled()
			expect(result).toEqual({gameId: playerId, rank: 11})
		})


		it('should create a game and not update the leaderboard if rank is beyond top 100', async () => {
			const playerId = 2
			const score = 800
			jest.spyOn(redis, 'zscore').mockResolvedValueOnce('700')
			jest.spyOn(gameRepository, 'save').mockResolvedValueOnce({id: playerId} as any)
			jest.spyOn(redis, 'zrevrank').mockResolvedValueOnce(120)
			jest.spyOn(socket, 'emitLeaderboardUpdate').mockImplementation()

			const result = await createGame(playerId, score)

			expect(redis.zscore).toHaveBeenCalledWith('leaderboard', playerId)
			expect(redis.zadd).toHaveBeenCalledWith('leaderboard', score, playerId)
			expect(gameRepository.save).toHaveBeenCalledWith({score: score, player: {id: playerId}})
			expect(redis.zrevrank).toHaveBeenCalledWith('leaderboard', playerId)
			expect(socket.emitLeaderboardUpdate).not.toHaveBeenCalled()
			expect(result).toEqual({gameId: playerId, rank: 121})
		})

		it('should create a game and not update the leaderboard rank if score is not the highest', async () => {
			const playerId = 3
			const score = 800
			jest.spyOn(redis, 'zscore').mockResolvedValueOnce('1000')
			jest.spyOn(gameRepository, 'save').mockResolvedValueOnce({id: playerId} as any)
			jest.spyOn(redis, 'zrevrank').mockResolvedValueOnce(150)
			jest.spyOn(socket, 'emitLeaderboardUpdate').mockImplementation()

			const result = await createGame(playerId, score)

			expect(redis.zscore).toHaveBeenCalledWith('leaderboard', playerId)
			expect(redis.zadd).not.toHaveBeenCalled()
			expect(gameRepository.save).toHaveBeenCalledWith({score: score, player: {id: playerId}})
			expect(redis.zrevrank).toHaveBeenCalledWith('leaderboard', playerId)
			expect(socket.emitLeaderboardUpdate).not.toHaveBeenCalled()
			expect(result).toEqual({gameId: playerId, rank: 151})
		})
	})
})