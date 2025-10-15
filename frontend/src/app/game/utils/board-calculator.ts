export interface BoardPosition {
  x: number;
  y: number;
}

export interface BoardSetupResult {
  boardImage: Phaser.GameObjects.Image;
  positions: BoardPosition[];
  cellSize: { width: number, height: number }; // NUEVO
}

export class BoardCalculator {
  /**
   * Configuración completa del tablero: imagen + posiciones + resize
   */
  static setupBoard(
    scene: Phaser.Scene,
    imageKey: string,
    onPositionsUpdate?: (positions: BoardPosition[], cellSize: { width: number, height: number }) => void
  ): BoardSetupResult {
    const { width, height } = scene.scale.gameSize;
    
    // Crear imagen del tablero
    const boardImage = scene.add.image(width / 2, height / 2, imageKey).setOrigin(0.5);
    BoardCalculator.fitImageToArea(boardImage, width, height);
    
    // Calcular posiciones iniciales
    let positions = BoardCalculator.updateBoardPositions(boardImage);
    let cellSize = BoardCalculator.getCellSize(boardImage);
    
    // Configurar redimensionamiento automático
    BoardCalculator.setupImageResize(scene, boardImage, () => {
      positions = BoardCalculator.updateBoardPositions(boardImage);
      cellSize = BoardCalculator.getCellSize(boardImage);
      
      if (onPositionsUpdate) {
        onPositionsUpdate(positions, cellSize);
      }
    });
    
    return { boardImage, positions, cellSize };
  }

  /**
   * Actualiza las posiciones del tablero basado en la imagen actual
   */
  static updateBoardPositions(boardImage: Phaser.GameObjects.Image): BoardPosition[] {
    const boardBounds = boardImage.getBounds();
    return BoardCalculator.calculateBoardPositions(boardBounds);
  }

  /**
   * Calcula el tamaño de una casilla del tablero
   */
  static getCellSize(boardImage: Phaser.GameObjects.Image): { width: number, height: number } {
    const boardBounds = boardImage.getBounds();
    return {
      width: boardBounds.width / 8,
      height: boardBounds.height / 5
    };
  }

  /**
   * Calcula el tamaño óptimo para las fichas basado en el tamaño de casilla
   * Permite que 4 fichas se vean cómodamente en una casilla
   */
  static getOptimalTokenScale(cellSize: { width: number, height: number }): number {
    // Tomar el menor de los dos para que quepa en cualquier orientación
    const minCellDimension = Math.min(cellSize.width, cellSize.height);
    
    // La ficha debe ocupar máximo el 60% de la casilla para permitir superposición
    const maxTokenSize = minCellDimension * 0.6;
    
    // Asumir que las fichas originales tienen ~100px (ajustar según tus imágenes)
    const originalTokenSize = 100;
    
    return maxTokenSize / originalTokenSize;
  }

  // ... resto de métodos existentes sin cambios ...
  
  static calculateBoardPositions(
    boardBounds: { x: number, y: number, width: number, height: number }
  ): BoardPosition[] {
    const { x: startX, y: startY, width: boardWidth, height: boardHeight } = boardBounds;
    
    const cellWidth = boardWidth / 8;
    const cellHeight = boardHeight / 5;
    const offsetX = cellWidth / 2;
    const offsetY = cellHeight / 2;
    
    const positions: BoardPosition[] = [];
    
    // FILA SUPERIOR: casillas 0-7 (izquierda → derecha)
    for (let col = 0; col < 8; col++) {
      positions.push({
        x: startX + col * cellWidth + offsetX,
        y: startY + offsetY
      });
    }
    
    // BORDE DERECHO: casillas 8-10 (arriba → abajo, sin esquinas)
    for (let row = 1; row < 4; row++) {
      positions.push({
        x: startX + 7 * cellWidth + offsetX,
        y: startY + row * cellHeight + offsetY
      });
    }
    
    // FILA INFERIOR: casillas 11-18 (derecha → izquierda)
    for (let col = 7; col >= 0; col--) {
      positions.push({
        x: startX + col * cellWidth + offsetX,
        y: startY + 4 * cellHeight + offsetY
      });
    }
    
    // BORDE IZQUIERDO: casillas 19-21 (abajo → arriba, sin esquinas)
    for (let row = 3; row >= 1; row--) {
      positions.push({
        x: startX + offsetX,
        y: startY + row * cellHeight + offsetY
      });
    }
    
    return positions;
  }

  static fitImageToArea(
    image: Phaser.GameObjects.Image,
    areaWidth: number,
    areaHeight: number,
    padding: number = 20
  ): void {
    const targetW = areaWidth - padding * 2;
    const targetH = areaHeight - padding * 2;
    const scaleX = targetW / image.width;
    const scaleY = targetH / image.height;
    const scale = Math.min(scaleX, scaleY);

    image.setDisplaySize(image.width * scale, image.height * scale);
  }

  static setupImageResize(
    scene: Phaser.Scene,
    image: Phaser.GameObjects.Image,
    onResize?: () => void
  ): void {
    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      image.setPosition(gameSize.width / 2, gameSize.height / 2);
      BoardCalculator.fitImageToArea(image, gameSize.width, gameSize.height);
      
      if (onResize) {
        onResize();
      }
    });
  }

  static waitForStableDimensions(
  boardImage: Phaser.GameObjects.Image,
  callback: (finalCellSize: { width: number, height: number }) => void,
  timeout: number = 500
): void {
  let checkCount = 0;
  let lastWidth = 0;
  let lastHeight = 0;
  const maxChecks = 10;
  
  const checkDimensions = () => {
    const bounds = boardImage.getBounds();
    const currentWidth = bounds.width;
    const currentHeight = bounds.height;
    
    checkCount++;
    
    // Si las dimensiones son estables (no han cambiado) o se alcanzó el límite
    if ((currentWidth === lastWidth && currentHeight === lastHeight && checkCount > 2) || checkCount >= maxChecks) {
      const cellSize = BoardCalculator.getCellSize(boardImage);
      console.log(`Dimensiones estables después de ${checkCount} checks: ${cellSize.width.toFixed(1)}x${cellSize.height.toFixed(1)}`);
      callback(cellSize);
      return;
    }
    
    lastWidth = currentWidth;
    lastHeight = currentHeight;
    
    // Seguir monitoreando
    setTimeout(checkDimensions, 50);
  };
  
  // Iniciar monitoreo
  setTimeout(checkDimensions, 100);
  
  // Timeout de seguridad
  setTimeout(() => {
    if (checkCount < maxChecks) {
      console.warn('Timeout esperando dimensiones estables, usando valores actuales');
      const cellSize = BoardCalculator.getCellSize(boardImage);
      callback(cellSize);
    }
  }, timeout);
  }
}
