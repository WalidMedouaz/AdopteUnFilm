import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FilmsComponent } from './films/films.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FilmsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AdopteUnFilm';

}
