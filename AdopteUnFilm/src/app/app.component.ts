import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FilmsComponent } from './films/films.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { CommonModule } from '@angular/common';
import { ConnexionService } from './connexion.service';
import { CommunicationService } from './communication.service';
//import '../../src/script.js';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [RouterOutlet, FilmsComponent, ConnexionComponent, NavbarComponent, UserInfoComponent, InscriptionComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'AdopteUnFilm';
  isConnected: boolean = false;
  notification = '';
  username: string | null = '';
  showSwiper: boolean = false;

  showUserInfo: boolean | undefined;

  showInscription = false;

  constructor(private http: HttpClient, private connexionService: ConnexionService, private communicationService: CommunicationService ) {}

  ngOnInit() {

    this.username = localStorage.getItem('username');

    this.communicationService.showUserInfo$.subscribe(showUserInfo => {
      this.showUserInfo = showUserInfo;
      if (showUserInfo) {
        const filmsContainer = document.getElementById('filmsContainer');
        if (filmsContainer) {
          filmsContainer.style.opacity = '0';
          filmsContainer.style.pointerEvents = 'none';
        }
      } else{
        const filmsContainer = document.getElementById('filmsContainer');
        if (filmsContainer) {
          filmsContainer.style.opacity = '100'; // Définition de la couleur de fond de filmsContainer à rouge
          filmsContainer.style.pointerEvents = 'visible';
        }
      }
    });

    this.connexionService.checkNotification();
    

    this.connexionService.notification$.subscribe(notification => {
      this.notification = notification;
      if (notification.includes('Connexion réussie !')) {
        this.showSwiper = true;
        // Afficher l'élément DOM filmsContainer
        const filmsContainer = document.getElementById('filmsContainer');
        if (filmsContainer) {
          filmsContainer.style.opacity = '100';
          filmsContainer.style.pointerEvents  = 'visible';
        }
      } else{
        this.showSwiper = false;
      }
    });
  }

  toggleInscription() {
    this.showInscription = !this.showInscription;
  }

}
