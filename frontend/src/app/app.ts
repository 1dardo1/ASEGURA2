import { Component } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HttpClientModule,
    RouterModule,
    // otros componentes que uses, p.ej HomeComponent, SetupComponent etc.
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}
