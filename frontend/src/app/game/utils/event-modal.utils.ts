import Phaser from 'phaser';
import { BoardScene } from '../scenes/board-scene';

export class EventModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private icon?: Phaser.GameObjects.Image;   // <- NUEVO
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

    const bg = this.scene.add.rectangle(0, 0, 350, 220, 0x333333, 0.95).setOrigin(0.5);

    // Imagen de seguro (se creará/mostrará dinámicamente)
    this.icon = this.scene.add.image(0, -70, '').setVisible(false).setScale(0.25);

    this.text = this.scene.add.text(0, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 320 },
      align: 'center'
    }).setOrigin(0.5);

    this.okBtn = this.scene.add.text(0, 80, 'OK', {
      fontSize: '18px',
      color: '#4CAF50',
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setPadding(10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.close());

    // Añadimos la imagen al contenedor
    this.container.add([this.overlay, bg, this.icon, this.text, this.okBtn]);
  }

  // message: texto, iconKey: clave de textura o null
  open(message: string, callback: () => void, iconKey?: string | null): void {
    this.text.setText(message);
    this.callback = callback;

    if (this.icon) {
      if (iconKey) {
        this.icon.setTexture(iconKey);
        this.icon.setVisible(true);
      } else {
        this.icon.setVisible(false);
      }
    }

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

  static async show(message: string, iconKey?: string | null): Promise<void> {
    if (!this.boardSceneRef) {
      console.error('❌ BoardScene no inicializado para EventModal');
      return;
    }
    await this.boardSceneRef.promptEvent(message, iconKey);
  }
}
export class WinModalManager {
  private static scene: Phaser.Scene | null = null;

  static setScene(scene: Phaser.Scene) {
    this.scene = scene;
  }

  static async showWinner(playerName: string): Promise<void> {
    if (!this.scene) {
      console.error('❌ WinModalManager: escena no inicializada');
      return;
    }

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    const container = this.scene.add.container(width / 2, height / 2).setDepth(10000);

    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: false });

    // FONDO BLANCO DEL MODAL
    const bg = this.scene.add.rectangle(0, 0, width * 0.8, height * 0.6, 0xffffff, 0.98)
      .setOrigin(0.5);

    const title = this.scene.add.text(0, -80, '🎉 ¡HAS GANADO!', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    const text = this.scene.add.text(
      0,
      0,
      `Enhorabuena, ${playerName}.\nHas contratado los 7 seguros.`,
      {
        fontSize: '20px',
        color: '#000000',
        align: 'center',
        wordWrap: { width: width * 0.7 }
      }
    ).setOrigin(0.5);

    // BOTÓN: verde de fondo, texto blanco
    const button = this.scene.add.text(0, 100, 'Volver a la pantalla de título', {
      fontSize: '22px',
      color: '#ffffff',        // texto blanco
      fontStyle: 'bold',
      backgroundColor: '#4CAF50' // fondo verde
    })
      .setOrigin(0.5)
      .setPadding(16, 10, 16, 10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.location.href = 'http://localhost:4200/';
      });

    container.add([overlay, bg, title, text, button]);
  }
}