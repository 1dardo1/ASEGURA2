import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-game-session-modal',
  templateUrl: './game-session-modal.component.html',
  styleUrls: ['./game-session-modal.component.css']
})
export class GameSessionModalComponent {
  @Input() players: string[] = [];
  @Output() continue = new EventEmitter<void>();
  @Output() newGame = new EventEmitter<void>();
}
