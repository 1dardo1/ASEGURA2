// src/app/game/utils/insurance-modal.utils.ts
import Phaser from 'phaser';
import { EventEffect } from './event.definitions';
import { BoardScene } from '../scenes/board-scene';

export interface InsuranceDecision {
  accepted: boolean;
  insuranceType?: string;
  insuranceCost?: number;
}

// ✅ InsuranceModal (ya lo tienes perfecto - NO TOCAR)
export class InsuranceModal {
  private scene!: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private icon?: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;
  private acceptBtn!: Phaser.GameObjects.Text;
  private rejectBtn!: Phaser.GameObjects.Text;
  private callback?: (accepted: boolean) => void;
  private overlay!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number) {
    this.scene = scene;
    this.createModal(gameWidth, gameHeight);
  }

private createModal(width: number, height: number): void {
  this.container = this.scene.add.container(width / 2, height / 2).setDepth(1000);
  this.container.setVisible(false);

  this.overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.5)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  // Más bajo de alto: 220 en vez de 260
  const bg = this.scene.add.rectangle(0, 0, 360, 220, 0x333333, 0.95).setOrigin(0.5);

  // Sube un poco el icono
  this.icon = this.scene.add.image(0, -50, '')
    .setVisible(false)
    .setScale(0.25);

  // Texto un poco más arriba
  this.text = this.scene.add.text(0, 10, '', {
    fontSize: '16px',
    color: '#ffffff',
    wordWrap: { width: 320 },
    align: 'center'
  }).setOrigin(0.5);

  // Botones más cerca del centro
  this.acceptBtn = this.scene.add.text(-80, 70, '✅ ACEPTAR', {
    fontSize: '18px',
    color: '#4CAF50',
    fontStyle: 'bold'
  })
    .setOrigin(0.5)
    .setPadding(10)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.close(true));

  this.rejectBtn = this.scene.add.text(80, 70, '❌ RECHAZAR', {
    fontSize: '18px',
    color: '#f44336',
    fontStyle: 'bold'
  })
    .setOrigin(0.5)
    .setPadding(10)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.close(false));

  this.container.add([
    this.overlay,
    bg,
    this.icon,
    this.text,
    this.acceptBtn,
    this.rejectBtn
  ]);
}


  open(
    description: string,
    cost: number,
    callback: (accepted: boolean) => void,
    iconKey?: string | null
  ): void {
    this.text.setText(`${description}\n\n💰 Costo: ${cost.toLocaleString()}€`);
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
    this.acceptBtn.input!.enabled = true;
    this.rejectBtn.input!.enabled = true;
    this.acceptBtn.setInteractive({ useHandCursor: true });
    this.rejectBtn.setInteractive({ useHandCursor: true });
  }

  private close(accepted: boolean): void {
    this.container.setVisible(false);
    this.container.setDepth(0);

    if (this.callback) {
      this.callback(accepted);
    }
  }
}

// ✅ AÑADIR ESTO AL FINAL DEL ARCHIVO (nuevo InsuranceModalManager)
export class InsuranceModalManager {
  private static boardSceneRef: BoardScene | null = null;

  static setBoardScene(scene: BoardScene) {
    this.boardSceneRef = scene;
  }

  static async show(tile: number, event: EventEffect, playerId: string): Promise<InsuranceDecision> {
    console.log(`🛡️ [MODAL PHASER] ${event.description}`);
    //console.log('insuranceType:', event.insuranceType);
    const iconKey = event.insuranceType ? `insurance-${event.insuranceType}` : null;
    //console.log('iconKey:', iconKey);
    

    if (!this.boardSceneRef) {
      console.error('❌ BoardScene no inicializado');
      return { accepted: false };
    }


    const accepted = await this.boardSceneRef.promptInsurance(
      event.description,
      event.insuranceCost!,
      iconKey
    );

    return {
      accepted,
      insuranceType: accepted ? event.insuranceType : undefined,
      insuranceCost: accepted ? event.insuranceCost : undefined,
    };
  }
}


