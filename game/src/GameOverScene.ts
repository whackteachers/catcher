import AbstractMenuScene from './abstractMenu'

export default class GameOverScene extends AbstractMenuScene {
    private playerName: string
    private score: number
    private rank: number
    constructor() {
        super('GameOverScene')
    }

    init(data) {
        this.playerName = data.playerName
        this.score = data.score
        this.rank = data.rank
    }

    create() {
        const { width, height } = this.game.scale

        this.add.image(width * 0.5, height * 0.5, 'background')
        this.add.text(width * 0.5, height * 0.16, 'Game Over', { fontSize: '48px', fontFamily: 'Arial' }).setOrigin(0.5)
        if (this.rank) {
            this.add.text(width * 0.5, height * 0.3, `Your best Rank: ${this.rank}`, { fontSize: '24px', fontFamily: 'Arial' }).setOrigin(0.5)
        }
        if (this.playerName) {
            this.add.text(width * 0.5, height * 0.4, `Player Name: ${this.playerName}`, { fontSize: '24px', fontFamily: 'Arial' }).setOrigin(0.5)
        }
        this.add.text(width * 0.5, height * 0.5, `Score: ${this.score}`, { fontSize: '24px', fontFamily: 'Arial' }).setOrigin(0.5)
        this.createMenuButton(width * 0.5, height * 0.7, 'Replay', { fontSize: '24px' }, 'GameScene')
        this.createMenuButton(width * 0.5, height * 0.8, 'Back to Menu', { fontSize: '24px' }, 'MenuScene')
        this.createLeaderboardButton(width * 0.5, height * 0.9, 'Check Leaderboard', { fontSize: '24px' })
    }
}
