import Phaser from 'phaser';
import { inject } from '@angular/core';
import { EventBus } from '../../services/event-bus';
import { PlayerService } from '../../services/player.service';
import { BoardCalculator, BoardPosition } from '../utils/board-calculator';
import { TokenManager } from '../utils/token-manager';
import { DiceFlowManager } from '../utils/dice-flow-manager';
import { GameFlowManager } from '../utils/game-flow-manager';
import { InsuranceModal, InsuranceModalManager } from '../utils/insurance-modal.utils';
import { EventModalManager, EventModal, WinModalManager } from '../utils/event-modal.utils'; 
import { DiceUtils } from '../utils/dice-utils';
import { PlayerCard, PlayerCardManager } from '../utils/player-card.utils';


export class BoardScene extends Phaser.Scene {
  private boardPositions: BoardPosition[] = [];
  private cellSize: { width: number, height: number } = { width: 100, height: 100 };
  private isSceneReady: boolean = false;
  private pendingPlayers: any[] | null = null;
  private boardImage!: Phaser.GameObjects.Image;
  private debugMarkers: Phaser.GameObjects.Graphics[] = [];
  private debugLabels: Phaser.GameObjects.Text[] = [];

  private insuranceModal!: InsuranceModal;
  private gameFlowManager!: GameFlowManager;
  private playerService!: PlayerService;
  private eventModal!: EventModal;
  private playerCard!: PlayerCard;
  



  constructor(playerService: PlayerService) {
    super({ key: 'BoardScene' });
    this.playerService = playerService;
  }

  preload() {
    this.load.image('board', 'assets/tablero.jpg');
    this.load.image('dice-img', 'assets/dado.png');
    
    for (let i = 1; i <= 8; i++) {
      this.load.image(`ficha${i}`, `assets/fichas/ficha${i}.png`);
    }

    const insuranceTypes = ['VIDA', 'HOGAR', 'COCHE', 'SALUD', 'VIAJE', "RESPONSABILIDAD_CIVIL", "CAJA_AHORROS"]; 
    insuranceTypes.forEach(type => {
      this.load.image(`insurance-${type}`, `assets/seguros/${type}.png`);
    });
  }

  create() {
    this.gameFlowManager = new GameFlowManager(this.playerService);
    this.setupBoard();
    this.setupEventListeners();
    this.time.delayedCall(200, () => this.finalizeSceneSetup());

    this.insuranceModal = new InsuranceModal(this, this.scale.width, this.scale.height);
    InsuranceModalManager.setBoardScene(this);

    const { width, height } = this.scale;
    this.eventModal = new EventModal(this, width, height);
    EventModalManager.setBoardScene(this);
    
    this.playerCard = new PlayerCard(this, width, height);
    PlayerCardManager.setBoardScene(this.playerCard, this);

    WinModalManager.setScene(this);

    }

  private setupBoard(): void {
    const { width, height } = this.scale.gameSize;
    this.boardImage = this.add.image(width / 2, height / 2, 'board').setOrigin(0.5);
    this.boardImage.setName('boardImage');
    BoardCalculator.fitImageToArea(this.boardImage, width, height);

    this.scale.on('resize', () => {
      BoardCalculator.handleResize(this, this.boardImage, (positions, cellSize) => {
        this.boardPositions = positions;
        this.cellSize = cellSize;
        TokenManager.updateAllTokenPositions(positions, cellSize);
        this.recreateDebugPositions();
        this.updateDicePosition();
        if (this.playerCard) {
          this.playerCard.updatePosition(this.scale.width, this.scale.height);
          const currentPlayerIndex = this.gameFlowManager.getCurrentPlayerIndex();
          this.updatePlayerCard(currentPlayerIndex);
        }
      });
    });


    BoardCalculator.waitForStableDimensions(this.boardImage, (finalCellSize) => {
      this.cellSize = finalCellSize;
      this.boardPositions = BoardCalculator.updateBoardPositions(this.boardImage);
      this.isSceneReady = true;
      
      if (this.pendingPlayers) {
        this.createTokensIfReady(this.pendingPlayers);
        this.pendingPlayers = null;
      }
    });
  }

  private finalizeSceneSetup(): void {
    const image = this.children.getByName('boardImage') as Phaser.GameObjects.Image;
    if (image) {
      this.cellSize = BoardCalculator.getCellSize(image);
      this.boardPositions = BoardCalculator.updateBoardPositions(image);
    }
    
    this.isSceneReady = true;
    
    if (this.pendingPlayers) {
      this.createTokensIfReady(this.pendingPlayers);
      this.pendingPlayers = null;
    }

    this.setupDiceFlow();
    // this.showDebugPositions();
  }

  private setupEventListeners(): void {
    EventBus.on('players-loaded', (players: any[]) => {
      this.createTokensIfReady(players);
      this.gameFlowManager.initialize(players.length);
      
      if (players.length > 0) {
        const currentIndex = this.gameFlowManager.getCurrentPlayerIndex();
        this.updatePlayerCard(currentIndex);
      }
    });

    // Escuchar cambios de turno
    EventBus.on('turn-changed', (data: { currentPlayerIndex: number }) => {
      this.updatePlayerCard(data.currentPlayerIndex);
    });
  }

  private createTokensIfReady(players: any[]): void {
    if (!this.isSceneReady || !this.add) {
      this.pendingPlayers = players;
      return;
    }
    
    try {
      TokenManager.createPlayerTokens(this, players, this.boardPositions, this.cellSize);
      console.log('âœ… Fichas creadas correctamente');
    } catch (error) {
      console.error('Error creando fichas:', error);
    }
  }

  private setupDiceFlow(): void {
    if (!this.boardImage) return;
    
    const boardBounds = this.boardImage.getBounds();
    const diceX = boardBounds.x + (boardBounds.width * 0.21);
    const diceY = boardBounds.y + (boardBounds.height * 0.69);
    const diceScale = BoardCalculator.getOptimalTokenScale(this.cellSize) * 0.5;
    
    // â­ UNA SOLA LÃNEA para configurar todo el flujo del dado
    DiceFlowManager.setupDiceFlow(this, diceX, diceY, diceScale, this.gameFlowManager, this.boardPositions);
  }

  private updateDicePosition(): void {
    if (!this.boardImage) return;
    
    const boardBounds = this.boardImage.getBounds();
    const diceX = boardBounds.x + (boardBounds.width * 0.21);
    const diceY = boardBounds.y + (boardBounds.height * 0.69);
    const diceScale = BoardCalculator.getOptimalTokenScale(this.cellSize) * 0.5;
    DiceUtils.updateDicePosition(diceX, diceY, diceScale);
    
  }

  // // DEBUG (command + /)
  // private showDebugPositions(): void {
  //   this.boardPositions.forEach((position, index) => {
  //   const marker = this.add.graphics();
  //   marker.fillStyle(0xff0000, 1);
  //   marker.fillCircle(position.x, position.y, 6);
  //   marker.setDepth(9999);
  //   this.debugMarkers.push(marker);

  //   const label = this.add.text(
  //   position.x + 10,
  //   position.y - 6,
  //   `${index}`,
  //   { fontSize: '12px', color: '#fff', backgroundColor: '#000', padding: { x: 3, y: 1 } }
  //   );
  //   label.setDepth(9999);
  //   this.debugLabels.push(label);
  //   });
  //   console.log(`ðŸ”´ Debug: ${this.boardPositions.length} posiciones marcadas`);
  // }

  private recreateDebugPositions(): void {
    this.debugMarkers.forEach(marker => marker.destroy());
    this.debugLabels.forEach(label => label.destroy());
    this.debugMarkers = [];
    this.debugLabels = [];
    // this.showDebugPositions();
  }
  async promptInsurance(description: string,cost: number,iconKey?: string | null): Promise<boolean> {
    return new Promise((resolve) => {
      this.insuranceModal.open(description, cost, (accepted) => resolve(accepted), iconKey);
    });
  }


  async promptEvent(message: string, iconKey?: string | null): Promise<void> {
    return new Promise<void>(resolve => {
      this.eventModal.open(message, () => resolve(), iconKey);
    });
  }
  private updatePlayerCard(playerIndex: number): void {
    this.playerService.getPlayers().subscribe(players => {
      if (players && players[playerIndex]) {
        const player = players[playerIndex];
        const colors = ['#e598c3', '#6f2e8d', '#006d9d', '#00aedf', '#018c3a', '#c8ad14', '#ff7903', '#e9447c'];
        
        PlayerCardManager.show({
          name: player.name,
          money: player.money,
          salary: player.salary,
          rent: player.rent,
          insurances: player.insurances || [],
          color: colors[playerIndex % colors.length]
        });
      }
    });
  }
}