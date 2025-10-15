import { Component } from '@angular/core';
import { SettingsButtonComponent } from "../../components/settings-button/settings-button.component";
import { PlayerService } from '../../services/player.service';
import { Router } from '@angular/router';
import { GameSessionModalComponent } from "../../components/game-session-modal/game-session-modal.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [SettingsButtonComponent, GameSessionModalComponent],
})
export class HomeComponent {
  showModal = false;
  modalPlayers: string[] = [];
  playerIds: string[] = [];

  constructor(private playerService: PlayerService, private router: Router) {}

  onPlayClick() {
    this.playerService.getPlayers().subscribe(players => {
      if (players.length === 0) {
        this.router.navigate(['/setup']);
      } else {
        this.modalPlayers = players.map((p: any) => p.name);
        this.playerIds = players.map((p: any) => p._id);
        this.showModal = true;
      }
    });
  }

  onContinueGame() {
    this.showModal = false;
    this.router.navigate(['/game']);
  }

  onNewGame() {
    // Eliminar todos los jugadores y navegar a setup
    let pending = this.playerIds.length;
    if (pending === 0) return;
    for (const id of this.playerIds) {
      this.playerService.deletePlayer(id).subscribe(_ => {
        pending--;
        if (pending === 0) {
          this.showModal = false;
          this.router.navigate(['/setup']);
        }
      });
    }
  }
}
