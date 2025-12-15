// src/app/game/utils/event-queue.utils.ts
import { getEventForTile, EventEffect } from './event.definitions';
import { PlayerService } from '../../services/player.service';
import { InsuranceModalManager } from './insurance-modal.utils';

export class EventQueueManager {
  private static readonly FIXED_TILES = [0, 11];
  private static readonly DB_TILES = [2, 5, 7, 13, 16, 18];

  /**
   * Procesa TODOS los eventos del camino en orden correcto
   * Solo seguros pausan (return true)
   */
static async processPathEvents(
  start: number, 
  end: number, 
  playerId: string,
  playerService: PlayerService
): Promise<boolean> {
  const boardSize = 22;
  const path = this.getPath(start, end, boardSize);
  
  console.log(`🛤️ Camino: ${start} → [${path.join(', ')}] → ${end}`);
  
  for (const tile of path) {
    const event = getEventForTile(tile);
    if (event) {
      console.log(`🎯 Procesando casilla ${tile}:`, event.description);
      
      if (this.FIXED_TILES.includes(tile)) {
        await this.handleFixed(tile, playerId, playerService);
        // ✅ Continúa (automático)
      } else if (this.DB_TILES.includes(tile)) {
        await this.handleDB(tile, playerId, playerService);
        // ✅ Continúa (automático)
      } else {
        // 🚨 SEGURO - DEBE PAUSAR
        console.log(`⏸️ PAUSANDO por seguro en ${tile}`);
        await this.handleInsurance(tile, event, playerId, playerService);
        return true;  // ✅ PAUSA AQUÍ
      }
    }
  }
  
  return false; // Sin seguros = continúa
}

  private static getPath(start: number, end: number, boardSize: number): number[] {
    const path: number[] = [];
    let pos = start;
    
    while (pos !== end) {
      pos = (pos + 1) % boardSize;
      path.push(pos);
    }
    
    return path.filter(tile => {
      return this.FIXED_TILES.includes(tile) || 
             this.DB_TILES.includes(tile) || 
             !!getEventForTile(tile);
    });
  }

  private static async handleFixed(tile: number, playerId: string, playerService: PlayerService) {
    // ... código existente de handleFixedEvent ...
  }

  private static async handleDB(tile: number, playerId: string, playerService: PlayerService) {
    // SIMULACIÓN eventos BD
    console.log(`📊 Evento BD casilla ${tile}: -100€ multa`);
    // TODO: Llamar API real
  }

  private static async handleInsurance(tile: number, event: EventEffect, playerId: string, playerService: PlayerService) {
    // ... código existente de handleInsuranceEvent ...
  }
}
