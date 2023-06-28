import AbstractMenuScene from './abstractMenu'

export default class MenuScene extends AbstractMenuScene {
	private background: Phaser.GameObjects.Image
	private title: Phaser.GameObjects.Text
	private start: Phaser.GameObjects.Text
	private leaderboard: Phaser.GameObjects.Text
	constructor () {
		super('MenuScene')
	}

	create() {
		const { width, height } = this.game.scale
		this.background = this.add.image(width * 0.5, height * 0.5, 'background')
		this.background.setOrigin(0.5).setScale(width / this.background.width, height / this.background.height)
		this.title = this.add.text(width * 0.5, height * 0.33, 'Catch Game', { fontSize: '64px', fontFamily: 'Arial' }).setOrigin(0.5)

		this.start = this.createMenuButton(width * 0.5, height * 0.5, 'Start Game', { fontSize: '24px' }, 'GameScene')
		this.leaderboard = this.createLeaderboardButton(width * 0.5, height * 0.6, 'Leaderboard', { fontSize: '24px' })
	}
}