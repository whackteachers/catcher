import * as Phaser from 'phaser'
import { createPlayer, savePlayerScore } from './api'

export default class GameScene extends Phaser.Scene {
    private score: number = 0
    private gameTime: number = 60
    private timer: Phaser.Time.TimerEvent
    private scoreText: Phaser.GameObjects.Text
    private timeLeftText: Phaser.GameObjects.Text
    private catcher: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    private items: Phaser.Physics.Arcade.Group
    private background: Phaser.GameObjects.Image

    constructor() {
        super('GameScene')
    }

    preload() {
        this.load.image('game_background', 'assets/bg1.png')
        this.load.image('catcher', 'assets/boat.png')
        this.load.image('p1', 'assets/p1.png')
        this.load.image('p2', 'assets/p2.png')
        this.load.image('p3', 'assets/p3.png')
        this.load.image('p4', 'assets/p4.png')
        this.load.image('e1', 'assets/e1.png')
        this.load.image('e2', 'assets/e2.png')
        this.load.audio('addScore', 'assets/addScore.wav')
        this.load.audio('minusScore', 'assets/minusScore.wav')
    }

    create() {
        const { width, height } = this.game.scale

        // Set up the game camera bounds
        this.cameras.main.setBounds(0, 0, width, height)
        this.background = this.add.image(width / 2, height / 2, 'game_background')
        this.background.setOrigin(0.5).setScale(width / this.background.width, height / this.background.height)

        this.score = 0
        this.scoreText = this.add.text(width * 0.05, height * 0.05, `Score: ${this.score}`,
            { fontSize: `${height * 0.08}px`, color: 'black', fontFamily: 'Arial' }).setDepth(1)
        this.gameTime = 60
        this.timer = this.time.addEvent({ delay: this.gameTime * 1000, callback: this.gameOver, callbackScope: this })
        this.timeLeftText = this.add.text(width * 0.7, height * 0.05, `Time: ${this.gameTime}`,
            { fontSize: `${height * 0.08}px`, color: 'black', fontFamily: 'Arial' }).setDepth(1)

        this.catcher = this.physics.add.sprite(width * 0.5, height * 0.9, 'catcher')
        this.catcher.setScale(0.1 * width / this.catcher.width)
        this.catcher.setCollideWorldBounds(true)
        this.catcher.body.setAllowGravity(false)

        this.sound.add('addScore')
        this.sound.add('minusScore')
        this.items = this.physics.add.group()
        this.spawnItem()

        this.physics.add.overlap(this.catcher, this.items, this.catchItem, null, this)
    }

    update(time ,delta) {
        let timeLeft = Math.ceil((this.timer.delay - this.timer.elapsed) / 1000)
        this.timeLeftText.setText(`Time: ${timeLeft}`)
        if (timeLeft <= 10) {
            this.timeLeftText.setColor('red')
        }
        this.moveCatcher()
        if (Phaser.Math.Between(1, 100) <= 1) {
            this.spawnItem()
        }
        const { height } = this.game.scale
        this.items.children.iterate((item: any): boolean => {
            if (!item) return
            if (item.y > height) {
                item.destroy()
            }
        })
    }

    moveCatcher() {
        const catcherSpeed = 300

        if (this.input.activePointer.isDown) {
            const pointerX = this.input.activePointer.x
            const catcherX = this.catcher.x

            if (pointerX < catcherX) {
                // Move left
                this.catcher.setVelocityX(-catcherSpeed)
            } else if (pointerX > catcherX) {
                // Move right
                this.catcher.setVelocityX(catcherSpeed)
            }
        }
    }

    spawnItem() {
        let itemKey, score, hitSound
        const randomValue = Math.random()
        if (randomValue < 0.8) {
            itemKey = Phaser.Utils.Array.GetRandom(['p1', 'p2', 'p3', 'p4'])
            hitSound = this.sound.get('addScore')
            score = 50
        } else {
            itemKey = Phaser.Utils.Array.GetRandom(['e1', 'e2'])
            hitSound = this.sound.get('minusScore')
            score = -100
        }

        const { width} = this.game.scale
        const x = Phaser.Math.Between(width * 0.08, width * 0.93)
        const item = this.physics.add.sprite(x, -50, itemKey)
        item.setScale(0.1 * width / item.width)
        item.setData({ score, hitSound })
        item.body.setAccelerationY(10)
        this.items.add(item)
    }

    catchItem(catcher, item) {
        this.score += item.getData('score')
        item.getData('hitSound').play()
        item.destroy()
        this.scoreText.setText(`Score: ${this.score}`)
    }

    async gameOver() {
        let data = { score: this.score, playerName: null, rank: null }
        try {
            this.input.removeAllListeners()
            let playerName, playerId
            const player = JSON.parse(localStorage.getItem('player'))
            if (!player) {
                playerName = prompt('Enter your name to see your rank (cancel to disregard your score):')
                if (playerName) {
                    const createdPlayer = await createPlayer(playerName)
                    playerId = createdPlayer?.id
                    playerName = createdPlayer?.name
                    if (playerId && playerName) {
                        localStorage.setItem('player', JSON.stringify({ id: playerId, name: playerName }))
                    }
                }
            } else {
                playerId = player.id
                playerName = player.name
            }
            const { rank } = await savePlayerScore(this.score, playerId)
            data.playerName = playerName
            data.rank = rank

        } catch (error) {
            alert(`Error when saving score: ${error}`)
        }
        this.scene.start('GameOverScene', data)
    }
}
