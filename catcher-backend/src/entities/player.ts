import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, CreateDateColumn } from 'typeorm'
import { Game } from './game'

@Entity()
export class Player extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	name: string

	@OneToMany(() => Game, game => game.player)
	games: Game[]

	@CreateDateColumn()
	created_at: Date
}
