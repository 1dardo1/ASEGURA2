import Phaser from 'phaser';
import { BoardScene } from '../scenes/board-scene';

export class EventModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private text!: Phaser.GameObjects.Text;
  private okBtn!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Rectangle;
  private callback?: () => void;

  constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number) {
    this.scene = scene;
    this.createModal(gameWidth, gameHeight);
  }

  private createModal(width: number, height: number): void {
    this.container = this.scene.add.container(width / 2, height / 2).setDepth(1000);
    this.container.setVisible(false);

    this.overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: false });

    const bg = this.scene.add.rectangle(0, 0, 350, 200, 0x333333, 0.95).setOrigin(0.5);

    this.text = this.scene.add.text(0, -20, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 320 },
      align: 'center'
    }).setOrigin(0.5);

    this.okBtn = this.scene.add.text(0, 60, 'OK', {
      fontSize: '18px',
      color: '#4CAF50',
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setPadding(10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.close());

    this.container.add([this.overlay, bg, this.text, this.okBtn]);
  }

  open(message: string, callback: () => void): void {
    this.text.setText(message);
    this.callback = callback;

    this.container.setVisible(true);
    this.container.setDepth(10000);

    this.okBtn.input!.enabled = true;
    this.okBtn.setInteractive({ useHandCursor: true });
  }

  private close(): void {
    this.container.setVisible(false);
    this.container.setDepth(0);

    if (this.callback) {
      this.callback();
    }
  }
}

export class EventModalManager {
  private static boardSceneRef: BoardScene | null = null;

  static setBoardScene(scene: BoardScene) {
    this.boardSceneRef = scene;
  }

  static async show(message: string): Promise<void> {
    if (!this.boardSceneRef) {
      console.error('❌ BoardScene no inicializado para EventModal');
      return;
    }
    await this.boardSceneRef.promptEvent(message);
  }
}
