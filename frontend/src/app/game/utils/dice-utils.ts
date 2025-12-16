import Phaser from 'phaser';
import { BoardPosition } from './board-calculator';

export class DiceUtils {
  private static diceButton: Phaser.GameObjects.Image | null = null;
  private static debugButton: Phaser.GameObjects.Text | null = null;
  private static scene: Phaser.Scene | null = null;
  private static overlay: Phaser.GameObjects.Rectangle | null = null;
  private static diceResultText: Phaser.GameObjects.Text | null = null;
  private static continueText: Phaser.GameObjects.Text | null = null;
  private static isAnimating: boolean = false;
  private static movementCompleteCallback: ((roll: number) => void) | null = null;
  
  // TODO: Cambiar a false en producción
  private static readonly DEBUG_MODE: boolean = true;

  static createDiceButton(
    scene: Phaser.Scene,
    imageKey: string,
    x: number,
    y: number,
    scale: number,
    onRoll: (roll: number) => void
  ) {
    DiceUtils.scene = scene;

    if (DiceUtils.diceButton) {
      DiceUtils.diceButton.destroy();
    }

    // Fondo circular blanquecino detrás del dado
    const radius = 140 * scale; // ajusta si hace falta
    const diceBg = scene.add.graphics();
    diceBg.fillStyle(0xffffff, 0.75); // blanco con algo de transparencia
    diceBg.fillCircle(x, y, radius);
    diceBg.setDepth(999); // justo por debajo del dado

    // Botón del dado
    DiceUtils.diceButton = scene.add.image(x, y, imageKey);
    DiceUtils.diceButton.setInteractive({ useHandCursor: true });
    DiceUtils.diceButton.setDepth(1000);
    DiceUtils.diceButton.setScale(scale);
    DiceUtils.diceButton.on('pointerdown', () => {
      if (DiceUtils.isAnimating) return;
      const roll = Phaser.Math.Between(1, 6);
      console.log('🎲 DADO LANZADO:', roll);
      DiceUtils.showDiceAnimation(roll, onRoll);
    });

    if (DiceUtils.DEBUG_MODE) {
      DiceUtils.createDebugButton(scene, x, y, scale, onRoll);
    }
  }

  private static createDebugButton(
    scene: Phaser.Scene,
    diceX: number,
    diceY: number,
    diceScale: number,
    onRoll: (roll: number) => void
  ): void {
    if (DiceUtils.debugButton) {
      DiceUtils.debugButton.destroy();
    }

    // Calcular offset proporcional al tamaño del dado
    const offsetX = 1550 * diceScale;
    const fontSize = Math.max(12, Math.floor(100 * diceScale));
    const padding = Math.max(6, Math.floor(12 * diceScale));

    DiceUtils.debugButton = scene.add.text(diceX + offsetX, diceY+ 10, 'Manual', {
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      backgroundColor: '#ff6b6b',
      padding: { x: padding, y: padding * 0.7 },
      fontStyle: 'bold'
    });
    DiceUtils.debugButton.setOrigin(0.5);
    DiceUtils.debugButton.setDepth(1000);
    DiceUtils.debugButton.setInteractive({ useHandCursor: true });
    
    DiceUtils.debugButton.on('pointerdown', () => {
      if (DiceUtils.isAnimating) return;
      DiceUtils.showDebugInput(onRoll);
    });
  }

  private static showDebugInput(onComplete: (roll: number) => void): void {
    DiceUtils.isAnimating = true;
    if (!DiceUtils.scene) return;

    const { width, height } = DiceUtils.scene.scale.gameSize;

    DiceUtils.overlay = DiceUtils.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    DiceUtils.overlay.setOrigin(0, 0);
    DiceUtils.overlay.setDepth(2000);
    DiceUtils.overlay.setInteractive();

    const inputText = DiceUtils.scene.add.text(
      width / 2, height / 2 - 200,
      'Introduce valor del dado (1-22):',
      { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }
    );
    inputText.setOrigin(0.5);
    inputText.setDepth(2001);

    const buttons: Phaser.GameObjects.Text[] = [];
    const buttonsPerRow = 11;
    const buttonWidth = 50;
    const buttonHeight = 50;
    const gapX = 10;
    const gapY = 10;

    for (let i = 1; i <= 22; i++) {
      const row = Math.floor((i - 1) / buttonsPerRow);
      const col = (i - 1) % buttonsPerRow;
      
      const startX = width / 2 - (buttonsPerRow * (buttonWidth + gapX)) / 2;
      const startY = height / 2 - 100;
      
      const btn = DiceUtils.scene.add.text(
        startX + col * (buttonWidth + gapX),
        startY + row * (buttonHeight + gapY),
        i.toString(),
        {
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#4CAF50',
          padding: { x: 12, y: 8 },
          fixedWidth: buttonWidth,
          fixedHeight: buttonHeight,
          align: 'center'
        }
      );
      btn.setOrigin(0.5);
      btn.setDepth(2002);
      btn.setInteractive({ useHandCursor: true });
      
      btn.on('pointerdown', () => {
        console.log('🔧 DEBUG: Dado manual =', i);
        DiceUtils.cleanupDebugInput([inputText, ...buttons]);
        DiceUtils.showDiceAnimation(i, onComplete);
      });
      
      buttons.push(btn);
    }
  }

  private static cleanupDebugInput(objects: Phaser.GameObjects.GameObject[]): void {
    objects.forEach(obj => obj.destroy());
    if (DiceUtils.overlay) DiceUtils.overlay.destroy();
    DiceUtils.overlay = null;
  }

  private static showDiceAnimation(finalResult: number, onComplete: (roll: number) => void): void {
    DiceUtils.isAnimating = true;
    if (!DiceUtils.scene) return;

    const { width, height } = DiceUtils.scene.scale.gameSize;

    if (!DiceUtils.overlay) {
      DiceUtils.overlay = DiceUtils.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
      DiceUtils.overlay.setOrigin(0, 0);
      DiceUtils.overlay.setDepth(2000);
      DiceUtils.overlay.setInteractive();
    }

    DiceUtils.diceResultText = DiceUtils.scene.add.text(
      width / 2, height / 2 - 50, '?',
      { fontSize: '120px', color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 8 }
    );
    DiceUtils.diceResultText.setOrigin(0.5);
    DiceUtils.diceResultText.setDepth(2001);

    let changeCount = 0;
    const maxChanges = 10;
    const changeInterval = setInterval(() => {
      if (!DiceUtils.diceResultText) return;
      const randomNum = Phaser.Math.Between(1, 6);
      DiceUtils.diceResultText.setText(randomNum.toString());
      changeCount++;

      if (changeCount >= maxChanges) {
        clearInterval(changeInterval);
        DiceUtils.diceResultText?.setText(finalResult.toString());

        DiceUtils.continueText = DiceUtils.scene!.add.text(
          width / 2,
          height / 2 + 80,
          'Haz clic para continuar',
          { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }
        );
        DiceUtils.continueText.setOrigin(0.5);
        DiceUtils.continueText.setDepth(2002);

        DiceUtils.overlay?.once('pointerdown', () => {
          DiceUtils.cleanupAnimation();
          onComplete(finalResult);
        });
      }
    }, 100);
  }

  private static cleanupAnimation(): void {
    if (DiceUtils.overlay) DiceUtils.overlay.destroy();
    if (DiceUtils.diceResultText) DiceUtils.diceResultText.destroy();
    if (DiceUtils.continueText) DiceUtils.continueText.destroy();
    DiceUtils.overlay = null;
    DiceUtils.diceResultText = null;
    DiceUtils.continueText = null;
    DiceUtils.isAnimating = false;
  }

  static setVisible(visible: boolean): void {
    if (DiceUtils.diceButton) {
      DiceUtils.diceButton.setVisible(visible);
    }
    if (DiceUtils.DEBUG_MODE && DiceUtils.debugButton) {
      DiceUtils.debugButton.setVisible(visible);
    }
  }

  static updateDicePosition(x: number, y: number, scale: number): void {
    if (DiceUtils.diceButton) {
      DiceUtils.diceButton.setPosition(x, y);
      DiceUtils.diceButton.setScale(scale);
    }
    
    if (DiceUtils.DEBUG_MODE && DiceUtils.debugButton) {
      // Actualizar posición y tamaño del botón DEBUG
      const offsetX = 1550 * scale;
      const fontSize = Math.max(12, Math.floor(100 * scale));
      const padding = Math.max(6, Math.floor(12 * scale));
      
      DiceUtils.debugButton.setPosition(x + offsetX, y);
      DiceUtils.debugButton.setStyle({
        fontSize: `${fontSize}px`,
        padding: { x: padding, y: padding * 0.7 }
      });
    }
  }

  private static getCurrentPlayerId(): string | null {
    return this.scene?.registry.get('currentPlayerId') || null;
  }

  private static getBoardPositionsFromScene(): BoardPosition[] | null {
    return this.scene?.registry.get('boardPositions') || null;
  }

  static setMovementCompleteCallback(callback: (roll: number) => void): void {
    DiceUtils.movementCompleteCallback = callback;
  }
}
