import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilmService {

  private _films = new BehaviorSubject<any[]>([]);

  constructor() { }

  get films() {
    return this._films.asObservable();
  }

  setFilms(films: any[]) {
    this._films.next(films);
  }

  resetFilms() {
    this._films.next([]);
  }
}
