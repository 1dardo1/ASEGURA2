import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingsButtonComponent } from "../../components/settings-button/settings-button.component";

interface TutorialScreen {
  title: string;
  description: string;
  imageUrl?: string;
  imageUrl2?: string;
}

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule, CommonModule, SettingsButtonComponent],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
})
export class SetupComponent {
  playerOptions = [2, 3, 4, 5, 6, 7, 8];
  playerCountSelected: number | null = null;
  playerNames: string[] = [];
  
  // Tutorial Modal
  showTutorial = false;
  currentTutorialScreen = 0;

  // Tutorial screens - fácil de extender
  tutorialScreens: TutorialScreen[] = [
    {
      title: 'Objetivo del Juego',
      description: 'El objetivo es ser el primero en comprar 1 seguro de cada tipo. Gana dinero al completar una vuelta y paga renta para no perder tu turno.',
    },
    {
      title: 'Targetas de jugador',
      description: 'En un lateral del tablero, verás las tarjetas de los jugadores con su dinero, sueldo, alquiler.',
      imageUrl: '/assets/tutorial/jugadores.png',
      imageUrl2: '/assets/tutorial/jugador.png'
    },
    {
      title: 'Sueldo',
      description: 'El sueldo es la cantidad de dinero que recibes por trabajar la consigues cada vez que pasas por la casilla verde de "sueldo".',
      imageUrl: '/assets/tutorial/sueldo.png',
    },
    {
      title: 'Alquiler ',
      description: 'El alquiler es la cantidad que debes pagar para tener una casa debes pagarla cuando pases por la casilla roja de "alquiler". Si no pagas el alquiler perderas tu siguiente turno',
      imageUrl: 'assets/tutorial/alquiler.png'
    }
  ];

  get playerIndices(): number[] {
    return Array(this.playerCountSelected || 0).fill(0).map((_, i) => i);
  }

  constructor(private router: Router, private playerService: PlayerService) {}

  selectPlayerCount(n: number) {
    this.playerCountSelected = n;
    this.playerNames = Array(n).fill('');
  }

  goBack() {
    this.playerCountSelected = null;
    this.playerNames = [];
  }

  // --- MÉTODOS DEL TUTORIAL ---

  startGame() {
    if (this.playerNames.some(name => !name.trim())) {
      alert('Por favor, rellena todos los nombres.');
      return;
    }

    // Mostrar modal del tutorial
    this.openTutorial();
  }

  openTutorial() {
    this.showTutorial = true;
    this.currentTutorialScreen = 0;
  }

  closeTutorial() {
    this.showTutorial = false;
    this.proceedToGame();
  }

  nextTutorialScreen() {
    if (this.currentTutorialScreen < this.tutorialScreens.length - 1) {
      this.currentTutorialScreen++;
    }
  }

  previousTutorialScreen() {
    if (this.currentTutorialScreen > 0) {
      this.currentTutorialScreen--;
    } else {
      // Cerrar el modal sin empezar la partida
      this.showTutorial = false;
    }
  }

  skipTutorial() {
    this.closeTutorial();
  }

  canGoNext(): boolean {
    return this.currentTutorialScreen < this.tutorialScreens.length - 1;
  }

  canGoPrevious(): boolean {
    return this.currentTutorialScreen > 0;
  }

  // --- FIN MÉTODOS DEL TUTORIAL ---

  private proceedToGame() {
    const playersToCreate = this.playerNames.map((name, index) => ({
      _id: `player_${index + 1}`,
      name: name.trim(),
      money: 1000,
      salary: 500,
      rent: 100,
      position: 0,
      insurances: [],
      skip: false,
      turn: index === 0
    }));

    let pending = playersToCreate.length;

    for (const player of playersToCreate) {
      this.playerService.createPlayer(player).subscribe({
        next: () => {
          pending--;
          if (pending === 0) {
            this.router.navigate(['/game']);
          }
        },
        error: (error) => {
          console.error('Error creando jugador:', error);
          alert('Error al crear los jugadores. Inténtalo de nuevo.');
        }
      });
    }
  }
}