import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap, delay } from 'rxjs';
import { EventBus } from './event-bus';
import { DBEvent } from '../game/utils/event.definitions';

export interface Player {
  _id: string;
  name: string;
  money: number;
  salary: number;
  rent: number;
  position: number;
  insurances: any[];
  skip: boolean;
  turn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/players';

  playersSignal = signal<Player[] | null>(null);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  constructor() {
    this.setupEventBusListener();
  }

  private setupEventBusListener(): void {
    EventBus.on('request-players', () => {
      const currentPlayers = this.playersSignal();
      if (currentPlayers && currentPlayers.length > 0) {
        setTimeout(() => {
          EventBus.emit('players-loaded', currentPlayers);
        }, 100);
      }
    });
  }

  loadPlayers() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.http.get<Player[]>(this.apiUrl).pipe(
      delay(50),
      catchError(err => {
        console.error('Error cargando jugadores:', err);
        this.errorSignal.set('Error cargando jugadores');
        this.loadingSignal.set(false);
        return of([] as Player[]);
      }),
      tap(players => {
        this.playersSignal.set(players);
        setTimeout(() => {
          EventBus.emit('players-loaded', players);
        }, 150);
        this.loadingSignal.set(false);
        console.log(`Jugadores cargados: ${players.length}`);
      })
    ).subscribe();
  }

  // NUEVOS MÉTODOS PARA ACTUALIZAR JUGADORES
  updatePlayer(playerId: string, updates: Partial<Player>) {
    return this.http.patch<Player>(`${this.apiUrl}/${playerId}`, updates).pipe(
      tap(updatedPlayer => {
        // Actualizar el signal local
        const currentPlayers = this.playersSignal();
        if (currentPlayers) {
          const updatedPlayers = currentPlayers.map(p => 
            p._id === playerId ? { ...p, ...updates } : p
          );
          this.playersSignal.set(updatedPlayers);
          EventBus.emit('player-updated', { playerId, updates: updatedPlayer });
        }
      }),
      catchError(err => {
        console.error('Error actualizando jugador:', err);
        return of(null);
      })
    );
  }

  updatePlayerPosition(playerId: string, newPosition: number) {
    return this.updatePlayer(playerId, { position: newPosition });
  }

  updatePlayerMoney(playerId: string, newMoney: number) {
    return this.updatePlayer(playerId, { money: newMoney });
  }

  updatePlayerTurn(playerId: string, turn: boolean) {
    return this.updatePlayer(playerId, { turn });
  }

  updatePlayerSkip(playerId: string, skip: boolean) {
    return this.updatePlayer(playerId, { skip });
  }

  getRandomEvent() {
    return this.http.get<DBEvent>('http://localhost:3000/events/random').pipe(
      catchError(err => {
        console.error('Error obteniendo evento:', err);
        return of(null);
      })
    );
  }



  // Métodos existentes
  getPlayers() { return this.http.get<Player[]>(this.apiUrl); }
  deletePlayer(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); }
  createPlayer(player: any) { return this.http.post<Player>(this.apiUrl, player); }
}
