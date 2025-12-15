import { DiceUtils } from './dice-utils';
import { GameFlowManager } from './game-flow-manager';
import { BoardPosition } from './board-calculator';

export class DiceFlowManager {
  static setupDiceFlow(
    scene: any,
    diceX: number,
    diceY: number,
    diceScale: number,
    gameFlowManager: GameFlowManager,
    boardPositions: BoardPosition[]
  ): void {
    DiceUtils.createDiceButton(
      scene,
      'dice-img',
      diceX,
      diceY,
      diceScale,
      async (diceValue) => {
        await DiceFlowManager.handleDiceResult(diceValue, gameFlowManager, boardPositions);
      }
    );
    console.log('🎲 Sistema de flujo del dado configurado');
  }

  private static async handleDiceResult(
    diceValue: number,
    gameFlowManager: GameFlowManager,
    boardPositions: BoardPosition[]
  ): Promise<void> {
    console.log(`📊 Procesando resultado del dado: ${diceValue}`);
    
    // VALIDAR SKIP ANTES DE PROCESAR EL DADO
    const shouldSkip = await gameFlowManager.checkAndHandleSkipTurn();
    if (shouldSkip) {
      console.log('⏭️ Turno saltado, esperando siguiente jugador');
      return;
    }

    await gameFlowManager.handleDiceRoll(diceValue, boardPositions);
  }
}
