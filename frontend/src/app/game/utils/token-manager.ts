import { BoardPosition } from './board-calculator';

export interface PlayerToken {
  sprite: Phaser.GameObjects.Image;
  playerId: string;
  currentPosition: number;
  playerIndex: number;
}

export class TokenManager {
  private static tokens: PlayerToken[] = [];
  private static currentCellSize: { width: number, height: number } = { width: 100, height: 100 };

  // En src/app/game/utils/token-manager.ts - Método createPlayerTokens con validación
  static createPlayerTokens(
    scene: Phaser.Scene,
    players: any[],
    boardPositions: BoardPosition[],
    cellSize: { width: number, height: number }
  ): PlayerToken[] {
    // Validaciones de seguridad
    if (!scene) {
      console.error('Error: scene es null');
      return [];
    }

    if (!scene.add) {
      console.error('Error: scene.add es null - escena no inicializada');
      return [];
    }

    if (!boardPositions || boardPositions.length === 0) {
      console.error('Error: boardPositions vacío');
      return [];
    }

    TokenManager.clearAllTokens();
    TokenManager.currentCellSize = cellSize;
    
    const optimalScale = TokenManager.calculateOptimalScale(cellSize) * 0.5; // 50% más pequeño
    
    players.forEach((player, index) => {
      try {
        const position = TokenManager.getPositionCoordinates(player.position, boardPositions);
        
        if (position) {
          const fichaKey = `ficha${index + 1}`;
          
          // Verificar que el asset existe
          if (!scene.textures.exists(fichaKey)) {
            console.warn(`Textura ${fichaKey} no encontrada. Usando placeholder.`);
            return;
          }
          
          const sprite = scene.add.image(position.x, position.y, fichaKey);
          sprite.setOrigin(0.5);
          sprite.setDepth(10 + index);
          sprite.setScale(optimalScale);
          
          const token: PlayerToken = {
            sprite,
            playerId: player._id,
            currentPosition: player.position,
            playerIndex: index
          };
          
          TokenManager.tokens.push(token);
          console.log(`Ficha ${index + 1} creada con escala ${optimalScale.toFixed(2)} en posición ${player.position}`);
        }
      } catch (error) {
        console.error(`Error creando ficha para jugador ${index + 1}:`, error);
      }
    });
    
    return [...TokenManager.tokens];
  }


  /**
   * Calcula la escala óptima para las fichas (50% más pequeñas)
   */
  private static calculateOptimalScale(cellSize: { width: number, height: number }): number {
    // Dimensión mínima de la casilla
    const minCellDimension = Math.min(cellSize.width, cellSize.height);
    
    // CAMBIADO: De 0.45 a 0.225 (50% más pequeño)
    // Las fichas ocuparán máximo 22.5% de la casilla
    const maxTokenSize = minCellDimension * 0.5;
    
    // Tamaño base estimado de las fichas
    const baseTokenSize = 80;
    
    const scale = maxTokenSize / baseTokenSize;
    
    // Límites de escala ajustados para fichas más pequeñas
    return Math.max(0.1, Math.min(0.8, scale));
  }


  /**
   * Actualiza las posiciones y escalas de todos los tokens
   */
  static updateAllTokenPositions(
    boardPositions: BoardPosition[], 
    cellSize?: { width: number, height: number }
  ): void {
    // Si hay nuevo tamaño de celda, recalcular escala
    if (cellSize) {
      TokenManager.currentCellSize = cellSize;
      const newScale = TokenManager.calculateOptimalScale(cellSize);
      
      TokenManager.tokens.forEach(token => {
        token.sprite.setScale(newScale);
      });
      
      console.log(`Tokens reescalados a ${newScale.toFixed(2)}`);
    }
    
    // Actualizar posiciones
    TokenManager.tokens.forEach(token => {
      const position = TokenManager.getPositionCoordinates(token.currentPosition, boardPositions);
      if (position) {
        token.sprite.setPosition(position.x, position.y);
      }
    });
  }

  static movePlayerToken(
    playerId: string,
    newPosition: number,
    boardPositions: BoardPosition[]
  ): boolean {
    const token = TokenManager.tokens.find(t => t.playerId === playerId);
    if (!token) return false;
    
    const position = TokenManager.getPositionCoordinates(newPosition, boardPositions);
    if (!position) return false;
    
    token.currentPosition = newPosition;
    token.sprite.setPosition(position.x, position.y);
    
    return true;
  }

  static getPlayerToken(playerId: string): PlayerToken | null {
    return TokenManager.tokens.find(t => t.playerId === playerId) || null;
  }

  static clearAllTokens(): void {
    TokenManager.tokens.forEach(token => token.sprite.destroy());
    TokenManager.tokens = [];
  }

  /**
   * Ajusta manualmente la escala de todas las fichas
   */
  static setCustomScale(scale: number): void {
    TokenManager.tokens.forEach(token => {
      token.sprite.setScale(scale);
    });
    console.log(`Escala personalizada aplicada: ${scale}`);
  }

  private static getPositionCoordinates(
    position: number,
    positions: BoardPosition[]
  ): BoardPosition | null {
    if (position < 0 || position >= positions.length) {
      return null;
    }
    return positions[position];
  }

  static getTokensInfo(): { playerId: string, position: number, playerIndex: number }[] {
    return TokenManager.tokens.map(token => ({
      playerId: token.playerId,
      position: token.currentPosition,
      playerIndex: token.playerIndex
    }));
  }

  static getTokenCount(): number {
    return TokenManager.tokens.length;
  }
}
