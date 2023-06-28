import * as Phaser from 'phaser'

export default abstract class AbstractMenuScene extends Phaser.Scene {
	protected constructor (name) {
		super(name)
	}

	preload() {
		this.load.image('background', 'assets/bg2.png')
	}

	createMenuButton(x: number, y: number, text: string, style: Object, onClick: string | Function) {
		const button = this.add.text(x, y, text, {...style, fontFamily: 'Arial'}).setOrigin(0.5)
		button.setInteractive()
		let action = typeof onClick === 'string' ? () => this.scene.start(onClick) : onClick
		button.on('pointerdown', action)
		button.on('pointerover', () => {
			button.setStyle({ backgroundColor: '#000000' }) // Change background color on hover
		})
		button.on('pointerout', () => {
			button.setStyle({ backgroundColor: 'transparent' }) // Revert background color on hover out
		})
		return button
	}

	createLeaderboardButton(x: number, y: number, text: string, style: any) {
		return this.createMenuButton(x, y, text, style, () => {
			window.open('http://localhost:3000', '_blank').focus()
		})
	}
}