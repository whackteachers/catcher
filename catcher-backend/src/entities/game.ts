import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn} from 'typeorm'
import { Player } from './player'

@Entity()
export class Game extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	score: number

	@ManyToOne(() => Player, player => player.games)
	player: Player

	@CreateDateColumn()
	created_at: Date
}
