import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, computed, inject } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { BoardScene } from '../../game/scenes/board-scene';
import { SettingsButtonComponent } from "../../components/settings-button/settings-button.component";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  standalone: true,
  imports: [SettingsButtonComponent],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;

  private ngZone = inject(NgZone);
  private playerService = inject(PlayerService);

  players = computed(() => this.playerService.playersSignal() ?? []);
  loading = computed(() => this.playerService.loadingSignal());
  error = computed(() => this.playerService.errorSignal());

  playerColors = ['#8e44ad', '#e67e22', '#3498db', '#e91e63', '#f1c40f', '#27ae60', '#9b59b6', '#1abc9c'];

  private game?: Phaser.Game;

  ngOnInit() {
    this.playerService.loadPlayers();
    this.initializePhaser();
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }

  private initializePhaser() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: this.gameContainer.nativeElement,
      width: 800,
      height: 600,
      backgroundColor: '#a2ce81',
      scene: BoardScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    this.ngZone.runOutsideAngular(() => {
      this.game = new Phaser.Game(config);
    });
  }

  openSettings() {
    console.log('Settings clicked');
  }
}
