import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private showUserInfoSubject = new BehaviorSubject<boolean>(false);
  showUserInfo$ = this.showUserInfoSubject.asObservable();

  toggleUserInfo() {
    this.showUserInfoSubject.next(true);
  }

  toggleFilms() {
    this.showUserInfoSubject.next(false);
  }
}
