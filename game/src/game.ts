import * as Phaser from 'phaser';
import MenuScene from './MenuScene'
import GameScene from './GameScene';
import GameOverScene from './GameOverScene';

let width = Math.min(window.innerWidth, 1280)
let height = Math.min(window.innerHeight, 720)
if (width < height) {
    // swap width and height to maintain screen ratio for mobile device portrait mode
    [width, height] = [height, width]
}
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        width,
        height,
        maxWidth: 1280,
        maxHeight: 720,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 100 },
        }
    },
    scene: [MenuScene, GameScene, GameOverScene]
}
const game = new Phaser.Game(config)
window.addEventListener('resize', () => {
    game.scale.refresh()
})