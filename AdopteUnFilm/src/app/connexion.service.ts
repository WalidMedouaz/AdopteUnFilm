import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnexionService {
  private notificationSource = new Subject<string>();
  notification$ = this.notificationSource.asObservable();

  private _estConnecte = new BehaviorSubject<boolean>(false);

  updateNotification(notification: string) {
    this.notificationSource.next(notification);
  }

  constructor(private httpClient: HttpClient){}

  checkNotification() {
  
    this.httpClient.get('/check-notification', { responseType: 'text' }).subscribe(
      (notification: string) => {
        this.updateNotification(notification);
      },
      error => {
        console.error('Erreur lors de la récupération de la notification:', error);
        this.updateNotification('');
      }
    );
  }

  get estConnecte() {
    return this._estConnecte.asObservable();
  }

  setEstConnecte(estConnecte: boolean) {
    this._estConnecte.next(estConnecte);
  }
}
