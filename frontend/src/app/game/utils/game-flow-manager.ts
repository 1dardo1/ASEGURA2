import Phaser from 'phaser';
import { PlayerService } from '../../services/player.service';
import { TokenManager, PlayerToken } from './token-manager';
import { BoardPosition } from './board-calculator';
import { EventFlowManager } from './event-flow-manager';
import { InsuranceModalManager } from './insurance-modal.utils';
import { EventModalManager } from './event-modal.utils';
import { EventBus } from '../../services/event-bus';

export class GameFlowManager {
  private currentPlayerIndex: number = 0;
  private totalPlayers: number = 0;
  private playerService: PlayerService;

  constructor(playerService: PlayerService) {
    this.playerService = playerService;
  }

  /**
   * Inicializa el sistema de flujo del juego con los jugadores
   */
  initialize(playerCount: number): void {
    this.totalPlayers = playerCount;
    this.currentPlayerIndex = 0;
  }

  /**
   * Procesa el lanzamiento del dado y movimiento de la ficha
   * Se ejecuta cuando el usuario hace clic en "continuar"
   */
  async handleDiceRoll(
    diceValue: number,
    boardPositions: BoardPosition[]
  ): Promise<void> {
    if (diceValue === 0) {
      console.warn('⚠️ Valor de dado inválido');
      return;
    }

    // Obtener jugador actual
    const currentToken = this.getCurrentPlayerToken();
    if (!currentToken) {
      console.error('❌ Token del jugador actual no encontrado');
      return;
    }

    // Calcular nueva posición (circular: después de 21 → 0)
    const oldPosition = currentToken.currentPosition;
    let newPosition = (oldPosition + diceValue) % boardPositions.length;

    console.log(`Movimiento circular: ${oldPosition} → ${newPosition}`);

    console.log(`Movimiento circular: ${oldPosition} → ${newPosition}`);

    // Animar movimiento
    await this.animateTokenMovement(currentToken, newPosition, boardPositions);

    // Detectar eventos de casillas
    const eventHandled = await EventFlowManager.handleTileEvents(
      oldPosition,
      newPosition,
      currentToken.playerId,
      this.playerService
    );

    // SOLO si NO hay flujo especial que se encargue solo
    if (!eventHandled) {
      await this.updatePlayerPositionInDatabase(currentToken.playerId, newPosition);
      TokenManager.movePlayerToken(currentToken.playerId, newPosition, boardPositions);
      this.nextTurn();
    }
  }

  /**
   * Anima el movimiento del token de forma suave
   */
  private async animateTokenMovement(
    token: PlayerToken,
    newPosition: number,
    boardPositions: BoardPosition[]
  ): Promise<void> {
    const scene = token.sprite.scene;
    const oldPosition = token.currentPosition;
    
    // Esquinas donde debe girar la ficha
    const corners = [0, 7, 11, 18];
    
    // Calcular camino: todos los positions que debe recorrer, incluyendo esquinas
    let pathPositions: number[] = [];

    let pos = oldPosition;
    while (pos !== newPosition) {
      pos = (pos + 1) % boardPositions.length;
      pathPositions.push(pos);

      if (corners.includes(pos) || pos === newPosition) {
        // Marca la posición si es esquina o destino final
        continue;
      }
    }

    // Recorrer el path por segmentos para animar
    for (let i = 0; i < pathPositions.length; i++) {
      const targetPos = pathPositions[i];
      await new Promise<void>((resolve) => {
        scene.tweens.add({
          targets: token.sprite,
          x: boardPositions[targetPos].x,
          y: boardPositions[targetPos].y,
          duration: 300, // menor duración para cada segmento
          ease: 'Quad.easeInOut',
          onComplete: () => {
            token.currentPosition = targetPos;
            resolve();
          }
        });
      });
    }

    console.log(`🎉 Ficha movida: ${oldPosition} → ${newPosition}`);
  }


  /**
   * Actualiza la posición del jugador en la base de datos
   */
  private async updatePlayerPositionInDatabase(
    playerId: string,
    newPosition: number
  ): Promise<void> {
    return new Promise((resolve) => {
      this.playerService.updatePlayerPosition(playerId, newPosition).subscribe(
        (result) => {
          if (result) {
            console.log(`✅ Posición actualizada en BD: ${newPosition}`);
          }
          resolve();
        },
        (error) => {
          console.error('❌ Error actualizando posición en BD:', error);
          resolve(); // Continuar incluso si hay error
        }
      );
    });
  }

  /**
   * Obtiene el token del jugador actual
   */
  private getCurrentPlayerToken(): PlayerToken | null {
    const tokens = TokenManager.getTokensInfo();
    if (tokens.length === 0) return null;

    const currentPlayerInfo = tokens[this.currentPlayerIndex];
    return TokenManager.getPlayerToken(currentPlayerInfo.playerId);
  }

  /**
   * Cambia al siguiente jugador
   */
  private nextTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.totalPlayers;
    const tokens = TokenManager.getTokensInfo();
    const nextPlayerIndex = tokens[this.currentPlayerIndex].playerIndex;
    console.log(`➡️ Turno del jugador ${nextPlayerIndex + 1}`);
    EventBus.emit('turn-changed', { currentPlayerIndex: nextPlayerIndex });

  }

  /**
   * Obtiene el índice del jugador actual
   */
  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  async checkAndHandleSkipTurn(): Promise<boolean> {
    const currentToken = this.getCurrentPlayerToken();
    if (!currentToken) return false;

    const players = await this.playerService.getPlayers().toPromise();
    const player = players?.find(p => p._id === currentToken.playerId);
    
    if (player && player.skip) {
      await EventModalManager.show(
        `⏭️ Turno perdido\n\nDebido a falta de fondos en el turno anterior, pierdes este turno.`
      );
      
      // Resetear skip y pasar turno
      await this.playerService.updatePlayer(player._id, { skip: false }).toPromise();
      this.nextTurn();
      return true;
    }
    
    return false;
  }



}
