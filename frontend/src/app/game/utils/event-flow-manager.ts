import { getEventForTile, FIXED_EVENTS, DB_EVENT_TILES, EventEffect } from './event.definitions';
import { PlayerService } from '../../services/player.service';
import { InsuranceModalManager, InsuranceDecision } from './insurance-modal.utils';
import { EventModalManager, WinModalManager } from './event-modal.utils';

export class EventFlowManager {
  private static readonly PASS_OR_LAND_TILES = [0, 11];

  static async handleTileEvents(
    oldPosition: number,
    newPosition: number,
    playerId: string,
    playerService: PlayerService
  ): Promise<boolean> {
    // 1. Detectar si pasamos por casilla 0 o 11 (sin caer en ella)
    const passedTiles = this.getPassedSpecialTiles(oldPosition, newPosition, 22);
    for (const tile of passedTiles) {
      await this.handleFixedEvent(tile, playerId, playerService);
    }

    // 2. Detectar evento de la casilla final
    const event = getEventForTile(newPosition);
    if (!event) return false;

    console.log(`🎯 EVENTO detectado en casilla ${newPosition}:`, event.description);

    if (this.PASS_OR_LAND_TILES.includes(newPosition)) {
      await this.handleFixedEvent(newPosition, playerId, playerService);
      // Evento de sueldo/alquiler procesado, pero el flujo sigue (posición + turno normal)
      return false;
    }

    if (event.fromDB) {
      await this.handleDBEvent(newPosition, playerId, playerService);
      // Devolver false para que GameFlowManager actualice posición y pase turno
      return false;
    }

    // Seguros: solo muestran modal de compra, no cambian turno ni posición
    await this.handleInsuranceEvent(newPosition, event, playerId, playerService);
    // Devolver false para que GameFlowManager actualice posición y pase turno
    return false;
  }

  private static getPassedSpecialTiles(start: number, end: number, boardSize: number): number[] {
    const passed: number[] = [];
    let current = start;

    while (current !== end) {
      current = (current + 1) % boardSize;
      if (current !== end && this.PASS_OR_LAND_TILES.includes(current)) {
        passed.push(current);
      }
    }

    return passed;
  }

  private static async handleFixedEvent(tile: number, playerId: string, playerService: PlayerService): Promise<void> {
    console.log(`💰 Procesando evento fijo en casilla ${tile}`);
    try {
      const players = await playerService.getPlayers().toPromise();
      const player = players?.find(p => p._id === playerId);
      if (!player) {
        console.error('❌ Jugador no encontrado');
        return;
      }

      let newMoney = player.money;
      let newSkip = player.skip;
      let message = '';

      if (tile === 0) {
        newMoney = player.money + player.salary;
        message = `Has cobrado tu sueldo de ${player.salary}€. Nuevo saldo: ${newMoney}€`;
      } else if (tile === 11) {
        if (player.money >= player.rent) {
          newMoney = player.money - player.rent;
          message = `Has pagado el alquiler de ${player.rent}€. Nuevo saldo: ${newMoney}€`;
        } else {
          newMoney = 0;
          newSkip = true;
          message = `⚠️ No tienes suficiente dinero para pagar el alquiler.\nTu dinero se establece a 0€ y pierdes el próximo turno.`;
        }
      }

      await playerService.updatePlayer(playerId, { money: newMoney, skip: newSkip }).toPromise();
      await EventModalManager.show(message);
      console.log(`✅ Jugador actualizado - Dinero: ${newMoney}€, Skip: ${newSkip}`);
    } catch (error) {
      console.error('❌ Error procesando evento fijo:', error);
    }
  }


  private static async handleDBEvent(tile: number, playerId: string, playerService: PlayerService): Promise<void> {
    console.log(`📊 Cargando evento de BD para casilla ${tile}`);
    
    const event = await playerService.getRandomEvent().toPromise();
    if (!event) {
      console.error('No se pudo obtener evento');
      return;
    }

    const players = await playerService.getPlayers().toPromise();
    const player = players?.find(p => p._id === playerId);
    if (!player) return;

    const hasInsurance = player.insurances.includes(event.tipo);
    const finalAmount = hasInsurance ? event.cantidad * event.descuento : event.cantidad;

    let updateData: any = { skip: player.skip };
    let message = event.texto;
    
    if (event.variable === 'money') {
      const newMoney = player.money + finalAmount;
      
      if (newMoney < 0) {
        updateData.money = 0;
        updateData.skip = true;
        message += `\n\n⚠️ No tienes suficiente dinero para pagar.\nTu dinero se establece a 0€ y pierdes el próximo turno.`;
      } else {
        updateData.money = newMoney;
      }
    } else if (event.variable === 'salary') {
      updateData.salary = player.salary + finalAmount;
    } else if (event.variable === 'rent') {
      updateData.rent = player.rent + finalAmount;
    }

    await playerService.updatePlayer(playerId, updateData).toPromise();

    await playerService.updatePlayer(playerId, updateData).toPromise();

    let extraText = '';
    if (event.tipo && event.tipo !== 'EVENTO') {
      if (hasInsurance) {
        if (event.descuento === 1) {
          extraText = `\n\n✅ Seguro ${event.tipo} contratado.\nNo tienes que pagar nada.`;
        } else if (event.descuento === 0.5) {
          extraText = `\n\n✅ Seguro ${event.tipo} contratado.\nSolo tienes que pagar la mitad.`;
        } else {
          extraText = `\n\n✅ Seguro ${event.tipo} contratado.`;
        }
      }
    }

    // Clave de imagen: solo si NO es EVENTO
    const iconKey =
      event.tipo && event.tipo !== 'EVENTO'
        ? `insurance-${event.tipo}`   // coincide con el preload de BoardScene
        : null;

    await EventModalManager.show(`${message}${extraText}`, iconKey);
    console.log(`✅ Evento aplicado. Jugador actualizado:`, updateData);

  }


  private static async handleInsuranceEvent(tile: number, event: EventEffect, playerId: string, playerService: PlayerService): Promise<void> {
    console.log(`🛡️ Procesando seguro en casilla ${tile}`);
    try {
      const players = await playerService.getPlayers().toPromise();
      const player = players?.find(p => p._id === playerId);
      
      if (!player) {
        console.error('❌ Jugador no encontrado');
        return;
      }

      // Validar si tiene dinero suficiente
      // Validar si ya tiene ese seguro
      if (event.insuranceType && player.insurances.includes(event.insuranceType)) {
        await EventModalManager.show(
          `❌ Ya tienes contratado el seguro ${event.insuranceType}.`
        );
        console.log(`❌ El jugador ya tiene el seguro ${event.insuranceType}`);
        return;
      }

      // Validar si tiene dinero suficiente
      if (player.money < (event.insuranceCost || 0)) {
        await EventModalManager.show(
          `❌ No tienes suficiente dinero para comprar el seguro ${event.insuranceType}.\n` +
          `Costo: ${event.insuranceCost}€ | Tu dinero: ${player.money}€`
        );
        console.log(`❌ Dinero insuficiente para seguro ${event.insuranceType}`);
        return;
      }


      const decision = await InsuranceModalManager.show(tile, event, playerId);
      
      if (decision.accepted && decision.insuranceCost && decision.insuranceType) {
        const newMoney = player.money - decision.insuranceCost;
        const newInsurances = [...player.insurances, decision.insuranceType];
              
        await playerService.updatePlayer(playerId, {
          money: newMoney,
          insurances: newInsurances
        }).toPromise();

        console.log(`✅ Seguro ${decision.insuranceType} comprado por ${decision.insuranceCost}€`);
        console.log(`💰 Dinero restante: ${newMoney}€`);

        if (newInsurances.length >= 7) {
          await WinModalManager.showWinner(player.name);
          return;
        }
      } else {
        console.log('❌ Seguro rechazado');
      }


    } catch (error) {
      console.error('❌ Error manejando seguro:', error);
    }
  }
}