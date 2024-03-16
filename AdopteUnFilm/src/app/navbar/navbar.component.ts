import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilmService } from '../film.service';
import { HttpClient } from '@angular/common/http';
import { ConnexionService } from '../connexion.service';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() username: string |null = '';

  constructor(
    private http: HttpClient,
    private connexionService: ConnexionService,
    private communicationService: CommunicationService,
    private filmService: FilmService
  ) { }

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
  }

  deconnexion() {
    this.http.get<any>(`/logout`)
      .subscribe(
        response => {
          if (response.success) {
            // Réinitialisation des films dans FilmService

            // Réinitialisation de la notification ou toute autre logique de déconnexion
            
            this.communicationService.toggleFilms();
            this.connexionService.updateNotification(response.notification);
            this.connexionService.setEstConnecte(false);
          } else {
            // Connexion échouée, ne rien faire ou gérer selon vos besoins
          }
        },
        error => {
          console.error('Erreur lors de la déconnexion:', error);
          // Gérer l'erreur ici, par exemple afficher un message d'erreur à l'utilisateur
        }
      );
  }

  showUserInfo() {
    this.communicationService.toggleUserInfo();
  }

  showFilms() {
    this.communicationService.toggleFilms();
  }

}
