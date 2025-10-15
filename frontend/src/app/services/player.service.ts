import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap, delay } from 'rxjs';
import { EventBus } from './event-bus';

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
        // Pequeño delay para asegurar que Phaser esté listo
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
      delay(50), // Pequeño delay para evitar race conditions
      catchError(err => {
        console.error('Error cargando jugadores:', err);
        this.errorSignal.set('Error cargando jugadores');
        this.loadingSignal.set(false);
        return of([] as Player[]);
      }),
      tap(players => {
        this.playersSignal.set(players);
        // Emitir con delay para asegurar sincronización
        setTimeout(() => {
          EventBus.emit('players-loaded', players);
        }, 150);
        this.loadingSignal.set(false);
        console.log(`Jugadores cargados: ${players.length}`);
      })
    ).subscribe();
  }

  getPlayers() { return this.http.get<Player[]>(this.apiUrl); }
  deletePlayer(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); }
  createPlayer(player: any) { return this.http.post(this.apiUrl, player); }
}
