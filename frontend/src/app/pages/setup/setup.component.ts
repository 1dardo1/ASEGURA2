import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { FormsModule } from '@angular/forms';
import { SettingsButtonComponent } from "../../components/settings-button/settings-button.component";

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule, SettingsButtonComponent],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
})
export class SetupComponent {
  playerOptions = [2, 3, 4, 5, 6, 7, 8];
  playerCountSelected: number | null = null;
  playerNames: string[] = [];

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

  startGame() {
    if (this.playerNames.some(name => !name.trim())) {
      alert('Por favor, rellena todos los nombres.');
      return;
    }

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
