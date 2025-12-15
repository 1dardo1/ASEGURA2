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
    // Contenedor centrado
    this.container = this.scene.add.container(width / 2, height / 2).setDepth(1000);
    this.container.setVisible(false);

    // 🖤 FONDO OSCURO que bloquea clicks fuera del modal
    this.overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Fondo del modal (blanco/gris)
    const bg = this.scene.add.rectangle(0, 0, 350, 220, 0x333333, 0.95).setOrigin(0.5);
    
    // Título
    const title = this.scene.add.text(0, -70, '🛡️ SEGURO', 
      { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    // Texto descriptivo
    this.text = this.scene.add.text(0, -20, '', 
      { fontSize: '16px', color: '#ffffff', wordWrap: { width: 320 }, align: 'center' })
      .setOrigin(0.5);

    // Botón Aceptar
    this.acceptBtn = this.scene.add.text(-80, 60, '✅ ACEPTAR', 
      { fontSize: '18px', color: '#4CAF50', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setPadding(10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.close(true));

    // Botón Rechazar
    this.rejectBtn = this.scene.add.text(80, 60, '❌ RECHAZAR', 
      { fontSize: '18px', color: '#f44336', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setPadding(10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.close(false));

    // ✅ AÑADIR overlay PRIMERO (está detrás del modal)
    this.container.add([this.overlay, bg, title, this.text, this.acceptBtn, this.rejectBtn]);
  }

  open(description: string, cost: number, callback: (accepted: boolean) => void): void {
    this.text.setText(`${description}\n\n💰 Costo: ${cost.toLocaleString()}€`);
    this.callback = callback;
    
    // ✅ SOLO mostrar y asegurar depth alto
    this.container.setVisible(true);
    this.container.setDepth(10000);  // Muy alto
    
    // Asegurar que botones estén interactivos
    this.acceptBtn.input!.enabled = true;
    this.rejectBtn.input!.enabled = true;
    this.acceptBtn.setInteractive({ useHandCursor: true });
    this.rejectBtn.setInteractive({ useHandCursor: true });
  }

  private close(accepted: boolean): void {
    this.container.setVisible(false);
    this.container.setDepth(0);  // Reset depth
    
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
    
    if (!this.boardSceneRef) {
      console.error('❌ BoardScene no inicializado');
      return { accepted: false };
    }
    const accepted = await this.boardSceneRef.promptInsurance(event.description, event.insuranceCost!);
    
    return {
      accepted,
      insuranceType: accepted ? event.insuranceType : undefined,
      insuranceCost: accepted ? event.insuranceCost : undefined,
    };
  }
}
