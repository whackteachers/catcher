import { DataSource } from 'typeorm'
import { Player } from './entities/player'
import { Game } from './entities/game'

const dataSource = new DataSource({
	type: 'sqlite',
	database: 'catcher.sqlite3',
	entities: ['src/entities/*.ts'],
	synchronize: true,
	logging: true,
})

dataSource.initialize().then(() => {
	console.log('Data Source has been initialized!')
}).catch(err => {
	console.error('Error during Data Source initialization', err)
})
export const playerRepository = dataSource.getRepository(Player)
export const gameRepository = dataSource.getRepository(Game)