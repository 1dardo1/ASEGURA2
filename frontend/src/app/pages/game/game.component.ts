import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, computed, inject, signal } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { BoardScene } from '../../game/scenes/board-scene';
import { SettingsButtonComponent } from "../../components/settings-button/settings-button.component";
import { EventBus } from '../../services/event-bus';

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
  
  currentPlayerIndex = signal<number>(0);
  playerColors = ['#e598c3', '#6f2e8d', '#006d9d', '#00aedf', '#018c3a', '#c8ad14', '#ff7903', '#e9447c'];
        
  private game?: Phaser.Game;
  private turnChangedCallback: (data: { currentPlayerIndex: number }) => void;

  constructor() {
    this.turnChangedCallback = (data: { currentPlayerIndex: number }) => {
      this.ngZone.run(() => {
        this.currentPlayerIndex.set(data.currentPlayerIndex);
      });
    };
  }

  ngOnInit() {
    this.playerService.loadPlayers();
    this.initializePhaser();
    this.setupTurnListener();
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }
    EventBus.off('turn-changed', this.turnChangedCallback);
  }

  private setupTurnListener(): void {
    EventBus.on('turn-changed', this.turnChangedCallback);
  }

  private initializePhaser() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: this.gameContainer.nativeElement,
      width: 800,
      height: 600,
      backgroundColor: '#a2ce81',
      scene: [new BoardScene(this.playerService)],
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
