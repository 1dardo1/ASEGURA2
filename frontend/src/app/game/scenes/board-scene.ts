// src/app/game/scenes/board-scene.ts
import Phaser from 'phaser';
import { EventBus } from '../../services/event-bus';
import { BoardCalculator, BoardPosition } from '../utils/board-calculator';
import { TokenManager } from '../utils/token-manager';

export class BoardScene extends Phaser.Scene {
  private boardPositions: BoardPosition[] = [];
  private cellSize: { width: number, height: number } = { width: 100, height: 100 };
  private isSceneReady: boolean = false;
  private pendingPlayers: any[] | null = null;

  constructor() {
    super({ key: 'BoardScene' });
  }

  preload() {
    this.load.image('board', 'assets/tablero.jpg');
    for (let i = 1; i <= 8; i++) {
      this.load.image(`ficha${i}`, `assets/fichas/ficha${i}.png`);
    }
  }

  create() {
    this.setupBoard();
    this.setupEventListeners();
    
    // Esperar a que el tablero tenga sus dimensiones finales antes de marcar como listo
    this.time.delayedCall(200, () => {
      this.finalizeSceneSetup();
    });
  }

// Versión más simple usando el monitor de dimensiones
  private setupBoard(): void {
    const { width, height } = this.scale.gameSize;
    
    // Crear imagen del tablero
    const boardImage = this.add.image(width / 2, height / 2, 'board').setOrigin(0.5);
    boardImage.setName('boardImage'); // Para encontrarla después
    BoardCalculator.fitImageToArea(boardImage, width, height);
    
    // Esperar a dimensiones estables antes de calcular posiciones
    BoardCalculator.waitForStableDimensions(boardImage, (finalCellSize) => {
      this.cellSize = finalCellSize;
      this.boardPositions = BoardCalculator.updateBoardPositions(boardImage);
      
      // Ahora marcar como listo
      this.isSceneReady = true;
      
      // Crear fichas pendientes
      if (this.pendingPlayers) {
        this.createTokensIfReady(this.pendingPlayers);
        this.pendingPlayers = null;
      }
      
      console.log(`Escena lista con cellSize final: ${finalCellSize.width.toFixed(1)}x${finalCellSize.height.toFixed(1)}`);
    });
    
    // Configurar redimensionamiento
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      boardImage.setPosition(gameSize.width / 2, gameSize.height / 2);
      BoardCalculator.fitImageToArea(boardImage, gameSize.width, gameSize.height);
      
      // Actualizar después de redimensionar
      BoardCalculator.waitForStableDimensions(boardImage, (newCellSize) => {
        this.cellSize = newCellSize;
        this.boardPositions = BoardCalculator.updateBoardPositions(boardImage);
        TokenManager.updateAllTokenPositions(this.boardPositions, this.cellSize);
      });
    });
  }

  private finalizeSceneSetup(): void {
  // Buscar el objeto board de forma segura
  const image = this.children.list.find(
    child => child instanceof Phaser.GameObjects.Image && (child as Phaser.GameObjects.Image).texture.key === 'board'
  ) as Phaser.GameObjects.Image | undefined;

  if (image) {
    this.cellSize = BoardCalculator.getCellSize(image);
    this.boardPositions = BoardCalculator.updateBoardPositions(image);
    console.log(`Tablero FINAL - Casilla: ${this.cellSize.width.toFixed(1)}x${this.cellSize.height.toFixed(1)}px`);
  } else {
    console.warn('No se pudo encontrar el objeto de la imagen del tablero para el cálculo final.');
  }

  this.isSceneReady = true;

  if (this.pendingPlayers) {
    this.createTokensIfReady(this.pendingPlayers);
    this.pendingPlayers = null;
  }

  console.log('BoardScene completamente finalizada con dimensiones correctas');
  }

  private setupEventListeners(): void {
    EventBus.on('players-loaded', (players: any[]) => {
      this.createTokensIfReady(players);
    });
    
    EventBus.emit('request-players');
  }

  private createTokensIfReady(players: any[]): void {
    if (!this.isSceneReady) {
      this.pendingPlayers = players;
      console.log('Jugadores recibidos, esperando finalización de escena...');
      return;
    }

    if (!this.add) {
      console.error('Error: this.add es null');
      return;
    }

    try {
      TokenManager.createPlayerTokens(this, players, this.boardPositions, this.cellSize);
      console.log(`Fichas creadas para ${players.length} jugadores con cellSize final: ${this.cellSize.width.toFixed(1)}x${this.cellSize.height.toFixed(1)}`);
    } catch (error) {
      console.error('Error creando fichas:', error);
    }
  }
}
